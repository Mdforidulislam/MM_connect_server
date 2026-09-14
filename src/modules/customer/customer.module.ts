import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaService } from '@/helper/prisma.service';
import { FileService } from '@/helper/file.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService, FileService],
  exports: [CustomerService],
})
export class CustomerModule {}
