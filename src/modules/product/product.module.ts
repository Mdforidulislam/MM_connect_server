import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BullModule } from '@nestjs/bull';
import { JobProcessorModule } from '@/job_process/job.process.module';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { SiemensService } from './apiProvider/siemens.service';
import { FoxcloudService } from './apiProvider/foxcloud.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
        BullModule.registerQueue({ name: 'product' }),
        JobProcessorModule,
        HttpModule
  ],
  controllers: [ProductController],
  providers: [ProductService, PrismaService,PrismaHelperService , SiemensService, FoxcloudService],
})

export class ProductModule {}
