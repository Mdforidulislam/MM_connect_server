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
import { BillingInfomationService } from './billing_infomation.service';

import { UpdateBillingInfomationDto } from './dto/update-billing_infomation.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';
import { CreateBillingInformationDto } from './dto/create-billing_infomation.dto';

@Controller('billing-infomation')
export class BillingInfomationController {
  constructor(
    private readonly billingInfomationService: BillingInfomationService,
  ) {}

  // CREATE
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async create(
    @Body() createBillingInfomationDto: any,
    @Req() req: any,
  ) {
    const user = req.user;
    const res = await this.billingInfomationService.create(
      createBillingInfomationDto,
      user,
    );
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Billing Infomation created successfully',
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
    const user = req.user;
    const res = await this.billingInfomationService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Billing Infomations fetched successfully',
      data: res,
    });
  }

  // GET ONE
  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findOne(@Param('id') id: string) {
    const res = await this.billingInfomationService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Billing Infomation fetched successfully',
      data: res,
    });
  }

  // UPDATE
  @Patch(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async update(
    @Param('id') id: string,
    @Body() updateBillingInfomationDto: any,
  ) {
    const res = await this.billingInfomationService.update(
      id,
      updateBillingInfomationDto,
    );
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Billing Infomation updated successfully',
      data: res,
    });
  }

  // DELETE
  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async remove(@Param('id') id: string) {
    const res = await this.billingInfomationService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Billing Infomation deleted successfully',
      data: res,
    });
  }
}
