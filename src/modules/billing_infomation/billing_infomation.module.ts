import { Module } from '@nestjs/common';
import { BillingInfomationService } from './billing_infomation.service';
import { BillingInfomationController } from './billing_infomation.controller';
import { PrismaService } from '@/helper/prisma.service';

@Module({
  controllers: [BillingInfomationController],
  providers: [BillingInfomationService, PrismaService],
})
export class BillingInfomationModule {}
