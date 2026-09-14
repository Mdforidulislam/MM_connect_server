import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { CreateCompnayInformationDto } from './dto/create-compnay_information.dto';
import { UpdateCompnayInformationDto } from './dto/update-compnay_information.dto';
import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class CompnayInformationService {
  constructor(private prisma: PrismaService) {}

  // CREATE company info
  async create(createCompnayInformationDto: any, user: any) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { userId: user?.id },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      const {
        company_Information,
        primary_business_contact,
      } = createCompnayInformationDto;

      if (!company_Information || !primary_business_contact) {
        throw new BadRequestException(
          'company_Information and primary_business_contact are required'
        );
      }

      // Check existing records
      const existingCompanyInfo = await this.prisma.companyInformation.findFirst({
        where: { customerId: customer.id },
      });

      const existingBusinessContact =
        await this.prisma.primaryBusinessContact.findFirst({
          where: { customerId: customer.id },
        });

      // --- COMPANY INFORMATION UPSERT ---
      let companyInfoResult;

      if (existingCompanyInfo) {
        companyInfoResult = await this.prisma.companyInformation.update({
          where: { id: existingCompanyInfo.id },
          data: {
            ...company_Information,
          },
        });
      } else {
        companyInfoResult = await this.prisma.companyInformation.create({
          data: {
            ...company_Information,
            customerId: customer.id,
          },
        });
      }

      // --- PRIMARY BUSINESS CONTACT UPSERT ---
      let businessContactResult;

      if (existingBusinessContact) {
        businessContactResult = await this.prisma.primaryBusinessContact.update({
          where: { id: existingBusinessContact.id },
          data: {
            ...primary_business_contact,
          },
        });
      } else {
        businessContactResult = await this.prisma.primaryBusinessContact.create({
          data: {
            ...primary_business_contact,
            customerId: customer.id,
          },
        });
      }

      return {
        companyInformation: companyInfoResult,
        primaryBusinessContact: businessContactResult,
      };
    } catch (error) {
      throw new BadRequestException(
        error || 'Failed to create or update company information'
      );
    }
  }

  // GET ALL (with filters & pagination)
  async findAllFindAllprimaryBusinessContact(user, query: Record<string, any> = {}) {

        const customer = await this.prisma.customer.findUnique({
          where: { userId: user?.id },
        })

        const findingPrimaryBusinessContact = await this.prisma.primaryBusinessContact.findMany({
          where: {
            customerId: customer?.id
          },
        });   

        return findingPrimaryBusinessContact;
  }
  async findAllCompanyInformation(user, query: Record<string, any> = {}) {

        const customer = await this.prisma.customer.findUnique({
          where: { userId: user?.id },
        })

        const findingCompanyInfo = await this.prisma.companyInformation.findMany({
          where: {
            customerId: customer?.id
          },
        });

        return findingCompanyInfo;

  }

  // GET ONE by ID
  async primaryBusinessContactFindOne(id: string) {
    const company = await this.prisma.primaryBusinessContact.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company information not found');
    }

    return company;
  }

  // GET ONE by ID
  async companyInformationFindOne(id: string) {
    const company = await this.prisma.companyInformation.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company information not found');
    }

    return company;
  }

  // UPDATE
  async primarybusinesscontactOne(id: string, updateCompnayInformationDto: any) {
 
    const updatedCompany = await this.prisma.companyInformation.update({
      where: { id },
      data: {
        ...updateCompnayInformationDto
      },
    });

    if (!updatedCompany) {
      throw new NotFoundException('Company information not found');
    }

    return updatedCompany;
  }

  async companyInformationUpdate(id: string, updateCompnayInformationDto: any) {
 
    const updatedCompany = await this.prisma.companyInformation.update({
      where: { id },
      data: {
        ...updateCompnayInformationDto
      },
    });

    if (!updatedCompany) {
      throw new NotFoundException('Company information not found');
    }

    return updatedCompany;
  }


  // DELETE
  async primarybusinesscontactoRemove(id: string) {

    const deletedCompany = await this.prisma.primaryBusinessContact.delete({
      where: { id },
    });

    return !!deletedCompany;
  }

  // DELETE
  async companyInformationRemove(id: string) {
  
    const deletedCompany = await this.prisma.companyInformation.delete({
          where: { id },
    })

    return !!deletedCompany;
  } 
}
