import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ShippingAddressService } from './shipping_address.service';
import { CreateShippingAddressDto } from './dto/create-shipping_address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping_address.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';

@Controller('shipping-address')
export class ShippingAddressController {
  constructor(private readonly shippingAddressService: ShippingAddressService) {}

  // CREATE
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async create(@Body() createShippingAddressDto: any, @Req() req: any) {
    const user = req.user;
    const res = await this.shippingAddressService.create(createShippingAddressDto, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Shipping address created successfully',
      data: res,
    });
  }

  // GET ALL
  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAll(
    @Req() req: any,
    @Query() query: Record<string, any>,
  ) {
    const user =  req.user;
    const res = await this.shippingAddressService.findAll(user, query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping addresses fetched successfully',
      data: res,
    });
  }

  // GET ONE
  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findOne(@Param('id') id: string) {
    const res = await this.shippingAddressService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping address fetched successfully',
      data: res,
    });
  }

  // UPDATE
  @Patch(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async update(@Param('id') id: string, @Body() updateShippingAddressDto: any) {
    const res = await this.shippingAddressService.update(id, updateShippingAddressDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping address updated successfully',
      data: res,
    });
  }

  // DELETE
  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async remove(@Param('id') id: string) {
    const res = await this.shippingAddressService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping address deleted successfully',
      data: res,
    });
  }
}
