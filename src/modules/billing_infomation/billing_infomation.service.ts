import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';

import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class BillingInfomationService {
  constructor(private prisma: PrismaService) {}

  // CREATE billing info
  async create(createBillingInfomationDto: any, user: any) {
    try {

      // Validate customer exists
      const customerExists = await this.prisma.customer.findUnique({
        where: { 
               userId:  createBillingInfomationDto?.customerId 
         },
      });

      if (!customerExists) {
        throw new BadRequestException('Customer not found');
      }

      const isBillingInfoExists = await this.prisma.billingInformation.findFirst({
        where: { customerId: customerExists?.id},
      });


      const normalizedData = {
                ...createBillingInfomationDto,
                paymentTerms: Array.isArray(createBillingInfomationDto.paymentTerms)
                            ? createBillingInfomationDto.paymentTerms
                            : createBillingInfomationDto.paymentTerms
                            ? [createBillingInfomationDto.paymentTerms]
                            : [],
              };

      if(isBillingInfoExists){
      const billingInfo =  await this.prisma.billingInformation.update({
          where: { customerId: customerExists?.id  },
          data: {
            ...normalizedData,
            customerId: customerExists?.id,
          }
        })

        return billingInfo
      }else if(!isBillingInfoExists){
      // Attach customerId
      const billingInfo = await this.prisma.billingInformation.create({
        data: {
            ...normalizedData,
            customerId: customerExists?.id,
        } 
      });

      return billingInfo;
      }

    } catch (error) {
      throw new BadRequestException(error || 'Failed to create billing information');
    }
  }

  // GET ALL billing info (with filters, pagination, etc.)
  async findAll(query: Record<string, any>, user: any) {
    const populateFields = query.populate
      ? query.populate.split(',').reduce((acc: Record<string, boolean>, field: string) => {
          acc[field] = true;
          return acc;
        }, {})
      : {};
      
    
    const customerExists = await this.prisma.customer.findUnique({where: {userId: user?.id}});
      
    const queryBuilder = new QueryBuilder(query, this.prisma.billingInformation);

    const result = await queryBuilder
      .search(['customerId', 'billingAddress', 'country', 'city', 'postalCode'])
      .filter([])
      .sort()
      .rawFilter({ customerId: customerExists?.id })
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }

  // GET ONE billing info by ID
  async findOne(id: string) {
    const billingInfo = await this.prisma.billingInformation.findUnique({
      where: { id },
    });

    if (!billingInfo) {
      throw new NotFoundException('Billing information not found');
    }

    return billingInfo;
  }

  // UPDATE billing info
  async update(id: string, updateBillingInfomationDto: any) {
    const existingBillingInfo = await this.prisma.billingInformation.findUnique({
      where: { id },
    });

    if (!existingBillingInfo) {
      throw new NotFoundException('Billing information not found');
    }

    const updatedBillingInfo = await this.prisma.billingInformation.update({
      where: { id },
      data: {
        ...updateBillingInfomationDto,
        updatedAt: new Date(),
      } as any
    });

    return updatedBillingInfo;
  }

  // DELETE billing info
  async remove(id: string) {
    const billingInfo = await this.prisma.billingInformation.findUnique({
      where: { id },
    });

    if (!billingInfo) {
      throw new NotFoundException('Billing information not found');
    }

    const deletedBillingInfo = await this.prisma.billingInformation.delete({
      where: { id },
    });

    return !!deletedBillingInfo;
  }
}
