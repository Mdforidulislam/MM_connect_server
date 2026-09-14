import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { CreateShippingAddressDto } from './dto/create-shipping_address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping_address.dto';
import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class ShippingAddressService {
  constructor(private prisma: PrismaService) {}

  // CREATE new shipping address
  async create(createShippingAddressDto: any, user: any) {
    try {
      
      // Validate customer exists
      const customerExists = await this.prisma.customer.findUnique({
        where: { userId: user?.id },
      });

      if (!customerExists) {
        throw new BadRequestException('Customer not found');
      }

      const shippingAddress = await this.prisma.shippingAddresses.create({
        data: {
          ...createShippingAddressDto,
          customerId: customerExists.id,
        } as any,
      });

      return shippingAddress;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create shipping address');
    }
  }

  // GET ALL with filters & pagination
  async findAll(user: any, query: Record<string, any> = {}) {
    const populateFields = query.populate
      ? query.populate.split(',').reduce((acc: Record<string, boolean>, field: string) => {
          acc[field] = true;
          return acc;
        }, {})
      : {};

    const customer = await this.prisma.customer.findUnique({where: {userId: user?.id}});

    const queryBuilder = new QueryBuilder(query, this.prisma.shippingAddresses);

    const result = await queryBuilder
      .search(['customerId', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'])
      .filter([])
      .rawFilter({ customerId: customer?.id })
      .sort()
      .paginate() 
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }

  // GET ONE
  async findOne(id: string) {
    const shippingAddress = await this.prisma.shippingAddresses.findUnique({
      where: { id },
    });

    if (!shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    return shippingAddress;
  }

  // UPDATE
  async update(id: string, updateShippingAddressDto: any) {
    const existingAddress = await this.prisma.shippingAddresses.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    const updatedAddress = await this.prisma.shippingAddresses.update({
      where: { id },
      data: {
        ...updateShippingAddressDto,
        updatedAt: new Date(),
      },
    });

    return updatedAddress;
  }

  // DELETE
  async remove(id: string) {
    const existingAddress = await this.prisma.shippingAddresses.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    const deletedAddress = await this.prisma.shippingAddresses.delete({
      where: { id },
    });

    return !!deletedAddress;
  }
}
