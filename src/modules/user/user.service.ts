import { PrismaService } from '@/helper/prisma.service';
import { BadRequestException, HttpStatus, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, User } from '@prisma/client';
import { ApiError } from 'src/utils/api_error';
import { BcryptService } from 'src/utils/bcrypt.service';
import { CreateUserAdminDto } from './dto/create-admin.dto';
import { BrevoService } from '@/email/brevo';
import { createUserDto } from './dto/create-user.dto';
import { CustomerService } from '../customer/customer.service';
import QueryBuilder from '@/utils/queryBuilder';
import { generateWelcomeApprovalEmail } from '@/email/template/user.approval';
import { generateAdminNotificationTemplate } from '@/email/template/admin.template.notification';
import { sendEmailWithHostinger } from '@/email/email.nodemail.config';


@Injectable()
export class UserService {
  
  constructor(
    private prisma: PrismaService,
    private bcryptService: BcryptService,
    private readonly configService: ConfigService,
    private readonly brevoService: BrevoService,
    private readonly customerService: CustomerService
  ) {}

  async createAdmin(data: CreateUserAdminDto) {
    const { admin: adminData, ...userData } = data;

    const result = await this.prisma.$transaction(
      async (tx) => {
        userData.role = Role.ADMIN;

        if (!userData.password) {
          userData.password = this.configService.get<string>(
            'DEFAULT_ADMIN_PASSWORD',
          );
        }

        userData.password = await this.bcryptService.hash(userData.password);

        const isEmailExists = await tx.user.findUnique({
          where: { email: userData?.email },
        });

        if (isEmailExists) {
          throw new ApiError(
            HttpStatus.CONFLICT,
            `user email is already exists`,
          );
        }

        const isContactNoExists = await tx.user.findUnique({
          where: { contactNo: userData?.contactNo },
        });

        if (isContactNoExists) {
          throw new ApiError(
            HttpStatus.CONFLICT,
            `contact no is already exists`,
          );
        }

        const userCreation = await tx.user.create({
          data: { ...userData, role: Role.ADMIN },
        });

        const adminCreation = await tx.admin.create({
          data: {
            ...adminData,
            userId: userCreation?.id,
          } as any,
        });

        if (!userCreation || !adminCreation) {
          throw new ApiError(
            HttpStatus.NOT_FOUND,
            'Failed to create admin and user',
          );
        }

        return userCreation;
      },
      {
        maxWait: 30000,
        timeout: 30000,
      },
    );

    return await this.prisma.user.findUnique({
      where: { id: result?.id },
      include: { admin: true },
    });
  }

 async createCustomer(data: createUserDto){
  const { customer: customerPayload, ...userPayload } = data;

  try {
    return await this.prisma.$transaction(async (tx) => {

      // ---------------------------------------------------------------------
      // 1. Check if user exists
      // ---------------------------------------------------------------------
      const existingUser = await tx.user.findUnique({
        where: { email: userPayload.email },
      });

      if (existingUser) {
        throw new NotAcceptableException('User already exists');
      }

      // ---------------------------------------------------------------------
      // 2. Create User
      // ---------------------------------------------------------------------
      const hashedPassword = await this.bcryptService.hash(userPayload.password);

      const newUser = await tx.user.create({
        data: {
          ...userPayload,
          password: hashedPassword,
          role: Role.CUSTOMER,
        },
      });

      // ---------------------------------------------------------------------
      // 3. Create Customer Profile
      // ---------------------------------------------------------------------
      
      const newCustomer = await this.customerService.createCustomer({
        ...customerPayload,
        userId: newUser.id,
      });

      // ---------------------------------------------------------------------
      // 4. Add Team Member
      // ---------------------------------------------------------------------

      if(newUser?.email){
        await this.prisma.teamMember.create({
          data: {
            customerId: newCustomer.id,
            email: newUser?.email,
            fullName: newCustomer.fullName,
            contactNo: newUser.contactNo
          }
        })
      }

       const findEmailExite = await    this.prisma.teamMember.findUnique({
          where:{
            email: newCustomer?.companyEmail
          }
        });

      if(newCustomer?.companyEmail && !findEmailExite){
        await this.prisma.teamMember.create({
        data: {
            customerId: newCustomer.id,
            email: newCustomer?.companyEmail,
            fullName: newCustomer.fullName,
            contactNo: newUser.contactNo
        } 
       })
      }

      if (!newCustomer) {
        throw new BadRequestException('Customer creation failed');
      }

      // ---------------------------------------------------------------------
      // 5. Notify admin (only if admin exists)
      // ---------------------------------------------------------------------
      const admin = await tx.user.findFirst({
        where: { role: Role.ADMIN },
      });

      if (admin) {
        const { subject, text, htmlContent } = generateAdminNotificationTemplate({
          adminName: 'Admin',
          user: {
            name: newCustomer?.fullName,
            email: newCustomer?.companyEmail,
            registeredAt: newCustomer.createdAt,
          },
        });

        await sendEmailWithHostinger({
          to: admin?.email,
          subject,
          text,
          htmlContent,
        });
      }

      // ---------------------------------------------------------------------
      // 6. Create ProviderProfitAdd for all brands (skip if exists)
      // ---------------------------------------------------------------------
      
      const allBrands = await tx.ourBrand.findMany();

      for (const brand of allBrands) {
        const exists = await tx.providerProfiteAdd.findUnique({
          where: {
            customerId_brandId: {
              customerId: newCustomer.id,
              brandId: brand.id,
            },
          },
        });

        if (!exists) {
          await tx.providerProfiteAdd.create({
            data: {
              customerId: newCustomer.id,
              brandId: brand.id,
            },
          });
        }
      }

      // ---------------------------------------------------------------------
      // 7. Return complete user with customer profile
      // ---------------------------------------------------------------------
      const createUser =  await tx.user.findUnique({
        where: { id: newUser.id },
        include: { customer: true },
      });

      return createUser;
    });

  } catch (error: unknown) {
    // Handle Prisma duplicate key error
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      throw new NotAcceptableException('Duplicate value exists');
    }

    throw error;
  }
}

async getMany( user: any,query: Record<string, string>,) {

    const queryBuilder = new QueryBuilder(query, this.prisma.user);
    const result = await queryBuilder
      .filter([])
      .search([])
      .nestedFilter([])
      .sort()
      .paginate()
      .rawFilter({
        role: Role.CUSTOMER
      })
      .include({
        customer: true
      })
      .fields()
      .filterByRange([])
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
}

async getOne(data: { email: string }): Promise<User | any | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.email }],
      },
      include: {
        admin: true,
        customer: true,
      },
    });

    return result;
}

async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
}

async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {

    return this.prisma.user.delete({
      where,
    });

}

async updatePassword({ id, password }: { id: string; password: string }) {
    return this.prisma.user.update({ where: { id }, data: { password } });
}

  async approveCustomer(id: string, bodyData: any) {

    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.isApproved === bodyData.isApproved) {
      throw new NotAcceptableException(`Customer is already ${bodyData.isApproved}`);
    }
    
  const update = await  this.prisma.customer.update({
      where: { id },
      data: { 
        isApproved: bodyData?.status
       },
      include: { user: true },
  });

  const {html, subject, text} =  generateWelcomeApprovalEmail({
      userName: update?.fullName, 
      userEmail: update?.user?.email, 
      applicationName: "MMCONNECT",
      approvalLink: "https://mmconnect.co.uk", 
      supportEmail: "orders@mmengservices.co.uk"
  });

  await sendEmailWithHostinger({
        to: update?.user?.email,
        subject: subject,
        text: text,
        htmlContent: html
  });
  return update;
  }
}
