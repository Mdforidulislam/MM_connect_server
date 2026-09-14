// job-processor.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from '@/helper/prisma.service';
import { JobProcessor } from './job.proccess.process';
import { WebsocketModule } from '@/ws/socket.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }),
    WebsocketModule
  ],
  providers: [JobProcessor, PrismaService],
})
export class JobProcessorModule {}





