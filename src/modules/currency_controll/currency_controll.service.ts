import { Injectable, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { CreateCurrencyControllDto } from './dto/create-currency_controll.dto';
import { UpdateCurrencyControllDto } from './dto/update-currency_controll.dto';
import { ApiError } from '@/utils/api_error';

@Injectable()
export class CurrencyControllService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCurrencyControllDto) {
    try {
      
      const isCreated = await this.prisma.currencyControll.findMany({});

      if (isCreated.length > 0) {
        throw new BadRequestException('Currency control already exists');
      }
      
      const currency = await this.prisma.currencyControll.create({
        data,
      });

      return currency;
    } catch (error) {
      throw new BadRequestException('Failed to create currency control');
    }
  }

  async findAll() {
    try {
      return await this.prisma.currencyControll.findMany({
        where: { isDelete: false },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch currency controls');
    }
  }

  async findOne() {
    try {
      const currency = await this.prisma.currencyControll.findMany({
        where: { isDelete: false },
        orderBy: { createdAt: 'desc' },
      });

      return currency[0];

    } catch (error) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch currency controls');
    }
  }

  async update(id: string, data: UpdateCurrencyControllDto) {
    const currency = await this.prisma.currencyControll.findUnique({ where: { id } });

    if (!currency || currency.isDelete) {
      throw new NotFoundException(`Currency control with ID ${id} not found`);
    }

    try {
      return await this.prisma.currencyControll.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update currency control');
    }
  }

  async remove(id: string) {
    const currency = await this.prisma.currencyControll.findUnique({ where: { id } });

    if (!currency || currency.isDelete) {
      throw new NotFoundException(`Currency control with ID ${id} not found`);
    }

    try {
      // Soft delete
      await this.prisma.currencyControll.update({
        where: { id },
        data: { isDelete: true },
      });

      return { message: 'Currency control deleted successfully' };
    } catch (error) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete currency control');
    }
  }
}
