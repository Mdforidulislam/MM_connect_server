import { Module } from '@nestjs/common';
import { ProfitMarginService } from './profit-margin.service';
import { ProfitMarginController } from './profit-margin.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [ProfitMarginController],
  providers: [ProfitMarginService, PrismaService, PrismaHelperService],
})
export class ProfitMarginModule {}
