import { Module } from '@nestjs/common';
import { CurrencyControllService } from './currency_controll.service';
import { CurrencyControllController } from './currency_controll.controller';
import { PrismaService } from '@/helper/prisma.service';

@Module({
  controllers: [CurrencyControllController],
  providers: [CurrencyControllService, PrismaService],
})
export class CurrencyControllModule {}
