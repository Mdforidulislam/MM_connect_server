import { Public } from '@/modules/auth/auth.decorator';
import { ResponseService } from '@/utils/response';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserAdminDto } from './dto/create-admin.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { createUserDto } from './dto/create-user.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  // @Roles(Role.ADMIN)
  @Public()
  @Post('create-admin')
  createAdmin(@Body() createAdminDto: CreateUserAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }
  
  @Public()
  @Post('create-customer')
  async  createCustomer(@Body() createCustomerDto: createUserDto) {
    const result = await this.usersService.createCustomer(createCustomerDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer created successfully',
      data: result
    });
  }

  @Get('/')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getUsers(
    @Req() req: any,
    @Query() query: Record<string, any>
  ) {
  
    const user = req?.user ;
    const result = await this.usersService.getMany(user, query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'user retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  @Patch("approve-customer/:id")
  @Roles(Role.ADMIN)
  async approveCustomer(
    @Body() data: any,
    @Param('id') id: string
  ) {

    const result = await this.usersService.approveCustomer(id, data);
    
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer approved successfully',
      data: result
    });
  }

  

}
