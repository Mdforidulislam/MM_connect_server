import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { CustomerService } from './customer.service';

import { ResponseService } from '@/utils/response';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import { FileService } from '@/helper/file.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly CustomerService: CustomerService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAll(
    @Query() query: Record<string, any>,
    @Req() req: any,
  ) {
    const user = req?.user;
    const result = await this.CustomerService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customers Found successfully',
      meta: result?.meta,
      data: result?.data,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.CustomerService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Found successfully',
      data: result,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    ParseFormDataInterceptor,
  )
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {

    const fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);

    const result = await this.CustomerService.update(
      id,
      updateCustomerDto,
      fileUrls ? fileUrls[0] : null,
    );
    
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Updated successfully',
      data: result,
    });
  }




  @Patch('shipping-cost/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async updateShippingCost(
    @Body() updateCustomerDto: any,
    @Param("id") id: string,
  ) {
    const result = await this.CustomerService.updateShippingCost(id,updateCustomerDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping cost updated successfully',
      data: result,
    });
    
  }

  @Patch('portalRefrence/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async updatePortalRefrence(
    @Body() updateCustomerDto: any,
    @Param("id") id: string,
    @Req() req: any
  ) {
    const result = await this.CustomerService.updatePortalCurrency(id,updateCustomerDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Shipping cost updated successfully',
      data: result,
    });
    
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.CustomerService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Deleted successfully',
      data: result,
    });
  }
}
