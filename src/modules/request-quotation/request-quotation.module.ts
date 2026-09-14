import { Module } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { QuontationController } from './request-quotation.controller';
import { QuotationService } from './request-quotation.service';

@Module({
  controllers: [QuontationController],
  providers: [QuotationService, PrismaService],
})

export class RequestQuotationModule {}
