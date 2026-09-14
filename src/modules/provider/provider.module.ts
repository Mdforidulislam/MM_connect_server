import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, PrismaService, PrismaHelperService],
})
export class ProviderModule {}
