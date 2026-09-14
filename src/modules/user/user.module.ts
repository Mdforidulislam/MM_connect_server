import { PrismaService } from '@/helper/prisma.service';
import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { BcryptService } from '@/utils/bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import { BrevoModule } from '@/email/brave.module';
import { CustomerService } from '../customer/customer.service';

@Module({
  imports: [ConfigModule, BrevoModule],
  controllers: [UsersController],
  providers: [UserService, CustomerService, PrismaService,  BcryptService],
  exports: [UserService,CustomerService],
})
export class UserModule {}
