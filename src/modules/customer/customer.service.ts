import { PrismaService } from '@/helper/prisma.service';
import { IGenericResponse } from '@/interface/common';
import { ApiError } from '@/utils/api_error';
import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Customer, Role } from '@prisma/client';
import { CustomerDto } from '../user/dto/create-customer.dto';
import QueryBuilder from '@/utils/queryBuilder';

// import { UpdateCustomerDto } from './dto/update-Customer.dto';

@Injectable()
export class CustomerService {
  
  constructor(
    private prisma: PrismaService
  ) {}

  async createCustomer(createCustomer: CustomerDto): Promise<Customer> {
    
    const customer = await this.prisma.customer.create({
      data: createCustomer as any
    });

    if(!customer){
      throw new BadRequestException('Customer creation failed');
    }
    return customer;
  }

  async findAll(
    query: Record<string, any>,
    user: any
  ): Promise<IGenericResponse<Customer[]>> {

    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};


    const queryBuilder = new QueryBuilder(query, this.prisma.user);
    const result = await queryBuilder
      .search(["name", "email", "contactNo","location"])
      .filter([])
      .sort()
      .nestedFilter([
        {
          key: "customer",
          searchOption: "search",
          queryFields: ["fullName","companyName"],
        }
      ])
      .paginate()
      .fields()
      .rawFilter({ 
        role: Role.CUSTOMER,
        ...(query?.isApproved
            ? {
                customer: {
                  isApproved: { in: [query.isApproved] },
                },
              }
            : {})

      })
      .include({
        customer: {
          include:{
            registeredBusinessAddress : true,
            primaryBusinessContact    : true,
            shippingAddresses         : true,
            BillingInformation        : true,
            companyInformation        : true,
          }
        },
      })
      .rawFilter({ role: Role.CUSTOMER })
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }

  async findOne(id: string) {
    let isCustomerExists = await this.prisma.customer
      .findUnique({
        where: { id },
      })
      .catch(() => null);

    if (!isCustomerExists) {
      isCustomerExists = await this.prisma.customer.findUnique({
        where: { userId: id },
      });
    }

    if (!isCustomerExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'Customer Not Found');
    }

    return await this.prisma.user.findFirst({
      where: { id: isCustomerExists?.userId },
      include: { 
         customer: {
          include:{
            registeredBusinessAddress : true,
            primaryBusinessContact    : true,
            shippingAddresses         : true,
            BillingInformation       : true,
            companyInformation       : true,
          }
        },
       }
    });
  }

  async updateShippingCost (id: string , data: any) {

    const customer = await this.prisma.customer.findUnique({
      where:{
        id
      }
    });

    if(!customer){
      throw new NotFoundException('Customer not found');
    }

    console.log(data,'checkitn data');

    const result = await this.prisma.customer.update({
      where: {
        id
      },
      data: {
        shippingCost: data?.shippingCost
      }
    });

    return result
  }

  async updatePortalCurrency(userId: any, value: {
    currency: string
  }){

      const userExite = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if(!userExite){
        throw new NotFoundException('User not found');
      }

      const customer = await this.prisma.customer.findUnique({
        where:{userId: userExite?.id}
      });

      if(!customer){
        throw new NotFoundException('Customer not found');
      }

      const result = await this.prisma.customer.update({
        where: {
          id: customer?.id
        },
        data: {
          ...value
        } as any
      });

      return result
  }

  async update(id: string, data: any, avatar: string) {
    const { customer, ...user } = data;

    const isUserExists = await this.findOne(id);

    const result = await this.prisma.$transaction(
      async (tx) => {

        if(!isUserExists){
           throw new NotFoundException('Customer not found');
        }

        const userUpdation = await this.prisma.user.update({
          where: { id: isUserExists?.id },
          data: { ...user, ...(avatar ? { avatar } : {}) },
        });

        const customerUpdation = await this.prisma.customer.update({
          where: { id: isUserExists?.customer.id },
          data: {
            ...customer,
          } as any,
        });

        return {
          ...userUpdation,
          customer: customerUpdation,
        };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return await this.prisma.user.findUnique({
      where: { id: result?.id },
      include: { customer: true },
    });
  }

  async remove(id: string) {
    const isUserExists = await this.findOne(id);

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    await this.prisma.$transaction(
      async (tx) => {
        const CustomerDeletion = await tx.customer.delete({
          where: { id: isUserExists?.customer.id },
        });

        const userDeletion = await tx.user.delete({
          where: { id: isUserExists.id },
        });
        return userDeletion;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return 'user deleted successfully';
  }
}

