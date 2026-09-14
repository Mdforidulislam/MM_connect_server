import { Module } from '@nestjs/common';
import { CompnayInformationService } from './compnay_information.service';
import { CompnayInformationController } from './compnay_information.controller';
import { PrismaService } from '@/helper/prisma.service';

@Module({
  controllers: [CompnayInformationController],
  providers: [CompnayInformationService, PrismaService],
})
export class CompnayInformationModule {}
