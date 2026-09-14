import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { CurrencyControllService } from './currency_controll.service';
import { CreateCurrencyControllDto } from './dto/create-currency_controll.dto';
import { UpdateCurrencyControllDto } from './dto/update-currency_controll.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';

@Controller('currency-controll')
export class CurrencyControllController {
  constructor(private readonly service: CurrencyControllService) {}

  @Post()
  async create(@Body() dto: CreateCurrencyControllDto) {
    const result = await this.service.create(dto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Currency control created successfully',
      data: result,
    });
  }

  @Get()
  async findAll() {
    const result = await this.service.findAll();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Currency controls fetched successfully',
      data: result,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Currency control fetched successfully',
      data: result,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCurrencyControllDto,
  ) {
    const result = await this.service.update(id, dto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Currency control updated successfully',
      data: result,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Currency control deleted successfully',
      data: result,
    });
  }
}
