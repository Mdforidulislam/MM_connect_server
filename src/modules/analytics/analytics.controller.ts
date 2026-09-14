import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../auth/auth.decorator';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';


@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}


  //  Geting Dashobard CardInfo Analytics
  @Get("/card")
  @Roles(Role.ADMIN)
  async getAnalyticsCard(
    @Req() req: any,
    @Query() query: Record<string, any>,
  ) {

    const user = req.user;
    const response =  await this.analyticsService.getAnalyticsCard(user,query);
   return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Analytics Found card successfully',
      data: response
    })
  
  }


  // geting dahsoard chart data
  @Get('/chart')
  @Roles(Role.ADMIN)
  async getAnalyticsChart(@Req() req: any, @Query() query: Record<string, any>) {
    const user = req.user;
    const response =  await this.analyticsService.getChart(user, query);
   return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Analytics Found successfully',
      data: response
    })
  }   


}
