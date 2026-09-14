import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { ProfitMarginService } from './profit-margin.service';

import { ResponseService } from '@/utils/response';
import { CreateProviderProfiteAddDto } from './dto/create-profit-margin.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { CreateManyProviderProfiteAddDto } from './dto/CreateManyProviderProfiteAddDto';

@Controller('profit-margin')
export class ProfitMarginController {
  constructor(private readonly profitMarginService: ProfitMarginService) {}

  @Post()
  @Roles(Role.ADMIN)
 async create(@Body() createProfitMarginDto: CreateManyProviderProfiteAddDto) {

    const result = await  this.profitMarginService.create(createProfitMarginDto);
    return ResponseService.formatResponse({ 
      statusCode: HttpStatus.OK,
       message: 'Profit Margin create successfully', 
       data: result 
      });
  }

  @Get()
  @Roles(Role.ADMIN)
 async findAll(
    @Query() query: Record<string, any>,

 ) {
    const result = await  this.profitMarginService.findAll(query);
    return ResponseService.formatResponse({ 
      statusCode: HttpStatus.OK,
       message: 'Profit Margin get successfully', 
       data: result
    }); 
  }

  @Get(':id')
 async findOne(@Param('id') id: string) {
    const result = await this.profitMarginService.findOne(id);
    return ResponseService.formatResponse({ 
      statusCode: HttpStatus.OK,
       message: 'Profit Margin get successfully', 
       data: result
    });
  }

  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateProfitMarginDto: any) {
    const result = await this.profitMarginService.update(id, updateProfitMarginDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
       message: 'Profit Margin updated successfully', 
       data: result
    })
  
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
  const result = await this.profitMarginService.remove(id);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
     message: 'Profit Margin deleted successfully', 
     data: result
  })  

}
}
