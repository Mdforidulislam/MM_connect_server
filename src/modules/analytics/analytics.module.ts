import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaService } from '@/helper/prisma.service';
import { FileService } from '@/helper/file.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, FileService, PrismaHelperService],
})
export class AnalyticsModule {}
