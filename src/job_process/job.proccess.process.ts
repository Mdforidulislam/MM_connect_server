import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '@/helper/prisma.service';
import { WebsocketGateway } from '@/ws/socket.service';

type CreateProductPayload = {
  data: any[];                 
  fileName: string;
  totalBatches: number; 
  currentBatch: number;    
  fileUploadId: string;        
};

type ProgressSocketPayload = {
  fileName: string;
  percent: number;
  totalBatches: number;
  status: 'success' | 'completed' | 'failed';
  error?: string;
  meta?: Record<string, any>;
};

@Processor('product')
export class JobProcessor {
  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly prisma: PrismaService,
  ) {}

  @Process('createProduct')
  async handleProductChunk(job: Job<CreateProductPayload>) {
    const { data, fileName, totalBatches, currentBatch, fileUploadId } = job.data;

    // --- Basic guards ---
    if (!Array.isArray(data)) {
      return this.failJob(job, fileName, totalBatches, currentBatch, fileUploadId, 'Data payload must be an array');
    }
    if (data.length === 0) {
      return this.failJob(job, fileName, totalBatches, currentBatch, fileUploadId, 'Empty batch received');
    }
    if (!totalBatches || totalBatches < 1) {
      return this.failJob(job, fileName, totalBatches ?? 0, currentBatch, fileUploadId, 'Invalid totalBatches');
    }

    const percent = this.computePercent(currentBatch, totalBatches);

    try {
      const createResult = await this.prisma.product.createMany({
        data
      });

      await this.safeProgress(job, percent);
      const isLastBatch = currentBatch + 1 === totalBatches;

      if (isLastBatch && createResult?.count) {
        await this.prisma.productUploadFile.update({
          where: { id: fileUploadId },
          data: {
            isComplate: true,
            percentage: 100
          },
        });
      }

    this.socketNotify({
        fileName,
        percent,
        totalBatches,
        status: 'success',
        meta: { insertedCount: createResult.count ?? 0, batch: currentBatch + 1 },
      });

    } catch (err: any) {
      const message = this.extractErrorMessage(err);
      await this.prisma.productUploadFile.update({
        where: { id: fileUploadId },
        data: {
          isComplate: false,
          percentage: percent
        },
      });

      await this.safeProgress(job, percent);

      this.socketNotify({
        fileName,
        percent,
        totalBatches,
        status: 'failed',
        error: message,
        meta: { batch: currentBatch + 1, attemptsMade: job.attemptsMade },
      });
      
      throw err;
    }
  }

  // --------- helpers ---------

  private computePercent(currentBatch: number, totalBatches: number): number {
    const raw = Math.floor(((currentBatch + 1) / totalBatches) * 100);
    return Math.min(100, Math.max(0, raw));
  }

  private async safeProgress(job: Job, percent: number) {
    try {
      await job.progress(percent);
    } catch {
      // ignore
      console.log(`Failed to update job progress for job ${job.id}`);
    }
  }

  private socketNotify(payload: ProgressSocketPayload) {
    try {
      this.websocketGateway.sendProgressToClients(payload);
    } catch {
      // Socket errors shouldn't crash the worker
    }
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unserializable error';
    }
  }

  private async failJob(
    job: Job,
    fileName: string,
    totalBatches: number,
    currentBatch: number,
    fileUploadId: string,
    reason: string,
  ) {
    const percent = this.computePercent(currentBatch, Math.max(1, totalBatches || 1));

    // Persist failed state
    try {
      await this.prisma.productUploadFile.update({
        where: { id: fileUploadId },
        data: {
          isComplate: false,
          percentage: percent
        },
      });
    } catch {
       console.log(`Failed to update product upload file with ID ${fileUploadId}`);
    }

    await this.safeProgress(job, percent);
    this.socketNotify({
      fileName,
      percent,
      totalBatches: totalBatches || 1,
      status: 'failed',
      error: reason,
      meta: { batch: currentBatch + 1 },
    });
    throw new Error(reason);
  }
}
