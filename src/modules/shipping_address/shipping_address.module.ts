import { Module } from '@nestjs/common';
import { ShippingAddressService } from './shipping_address.service';
import { ShippingAddressController } from './shipping_address.controller';
import { PrismaService } from '@/helper/prisma.service';

@Module({
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService,PrismaService],
})
export class ShippingAddressModule {}
