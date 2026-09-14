import { PrismaService } from '@/helper/prisma.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuotaStatus, QuotaType, Currency, User, Customer, Role } from '@prisma/client';
import QueryBuilder from '@/utils/queryBuilder';
import { sendEmailWithSendGrid } from '@/email/sendGrid';
import { generateProfessionalQuotationEmail } from '@/email/template/product.request.tample';
import { generateRFQConfirmationEmail } from '@/email/template/request.quation.customer';
import { sendEmailWithHostinger } from '@/email/email.nodemail.config';
interface QuotationFilters {
  customerId?: string;
  status?: QuotaStatus;
  type?: QuotaType;
  page: number;
  limit: number;
}

@Injectable()
export class QuotationService {
  constructor(private prisma: PrismaService) {}

  // Generate unique quotation reference ID
private async generateQuotationReference(type?: string): Promise<string> {

     const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

     while (true){
        let refQuestionId = '';
        for (let i = 0; i < 4; i++) {
          const randomIndex = Math.floor(Math.random() * chars.length);
          refQuestionId += chars[randomIndex];
        }
        
        const existingQuotation = await this.prisma.saveQuates.findUnique({
          where: {
            quoationGenerateId : refQuestionId
          }
        });

        if (!existingQuotation) {
             if(type === QuotaType.SAVE_QUOTATION){
               return `SVQ_${refQuestionId}`;
             } else {
               return `RFQ_${refQuestionId}`;
             }
        }
     }

}

// Create new quotation
  async createQuotation(user: any , createQuotationDto: any) {
    try {
      // Validate customer exists
      const customerExists = await this.prisma.customer.findUnique({
        where: { 
          userId: user?.id
        }
      });

      const userExists = await this.prisma.user.findUnique({
        where: { 
          id: user?.id
        },
        select:{
          customer:{
            select:{
              teamMembers: true
            }
          }
        }
      });

      if (!customerExists) {
        throw new BadRequestException('Customer not found');
      }

      createQuotationDto.customerId = customerExists?.id;

      // Generate quotation reference ID
      const quoationGenerateId = await this.generateQuotationReference(createQuotationDto?.quationType);
      const quotation = await this.prisma.saveQuates.create({
        data: {
          ...createQuotationDto,
          status: QuotaStatus.PENDING, 
          quoationGenerateId: quoationGenerateId,
        } as any
      });


      if(quotation?.quationType === QuotaType.REQUEST_QUOTATION){
        // Admin email send config 
        const findAdmin = await this.prisma.user.findFirst({
          where:{
            role: Role.ADMIN
          }
        });

          const {html, subject} = generateProfessionalQuotationEmail({
                    companyName: customerExists?.companyName,
                    refferenceNumber: createQuotationDto?.quataReferenceId || "",
                    teamMemberEmail: createQuotationDto.email,
                    teamMemberName: createQuotationDto?.customerName || userExists?.customer?.teamMembers[0]?.fullName,
                    customerEmail: createQuotationDto?.email,
                    quotationReference: quoationGenerateId,
                    productList: createQuotationDto?.productList,
                    currency: createQuotationDto?.currency,
                    shippingCost: customerExists?.shippingCost,
                  });

          sendEmailWithHostinger({
                      to: findAdmin?.email, 
                      subject: subject,
                      text: "RFQ",
                      htmlContent: html
          });

          // send email config customer 
          const {html: html2, subject: subject2} = generateRFQConfirmationEmail({
                    companyName: customerExists?.companyName,
                    refferenceNumber: createQuotationDto?.quataReferenceId || "",
                    teamMemberEmail: createQuotationDto.email,
                    teamMemberName: createQuotationDto?.customerName || userExists?.customer?.teamMembers[0]?.fullName,
                    customerEmail: createQuotationDto?.email,
                    quotationReference: quoationGenerateId,
                    productList: createQuotationDto?.productList,
                    currency: createQuotationDto?.currency,
                    shippingCost: customerExists?.shippingCost,
          });

          sendEmailWithHostinger({
                      to: createQuotationDto.email, 
                      subject: subject2,
                      text: "RFQ",
                      htmlContent: html2
          });
      }

      return quotation;
    } catch (error) {
      throw new BadRequestException(error || 'Failed to create quotation');
    }
  }

  // Get all quotations with filtering
  async findAllQuotations(query: Record<string, any>,user: any) {

        const populateFields = query.populate
            ? query.populate
                .split(',')
                .reduce((acc: Record<string, boolean>, field) => {
                  acc[field] = true;
                  return acc;
                }, {})
          : {};

        const isRole = user?.role === "ADMIN";
        let customer : Customer;
        if(!isRole){
           customer = await this.prisma.customer.findUnique({where: {userId: user?.id}});
        } 

        const queryBuilder = new QueryBuilder( query , this.prisma.saveQuates);
        const result = await queryBuilder
          .search(["quataReferenceId","email","customer.fullName", "quoationGenerateId", ])
          .filter(["status","email","currency", "quataReferenceId" ,"quoationGenerateId"])
          .sort()
          .filterByRange([{
            field: "createdAt",
            maxQueryKey: "maxDate",
            minQueryKey: "minDate",
            dataType: "date"
          }])
          .rawFilter({
            ...(isRole ? {
              quationType: QuotaType.REQUEST_QUOTATION,
            } : { 
              customerId: customer?.id ,
              quationType: QuotaType.SAVE_QUOTATION,
             })
          })
          .include({
            customer: true
          })
          .nestedFilter([
            {
              key: "customer",
              searchOption: "search",
              queryFields: [
                // {
                //   field: "name",
                 
                // },
              ],
            },
          ])
          .paginate()
          .fields()
          .populate(populateFields)
          .execute();

        const meta = await queryBuilder.countTotal();

        return { meta, data: result };
  }

  // Get quotation by ID
  async findQuotationById(id: string) {
    try {
      const quotation = await this.prisma.saveQuates.findUnique({
        where: { id },
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found');
      }

      return quotation;
    } catch (error) {
      throw error;
    }
  }

  // Update quotation
  async updateQuotation(id: string, updateQuotationDto: Record<string, any>) {
    try {
      // Check if quotation exists
      const existingQuotation = await this.prisma.saveQuates.findUnique({
        where: { id }
      });

      if (!existingQuotation) {
        throw new NotFoundException('Quotation not found');
      }

      // // Don't allow updates to completed or cancelled quotations
      // if ([QuotaStatus.COMPLETED, QuotaStatus.CANCELLED].includes(existingQuotation.status)) {
      //   throw new BadRequestException('Cannot update completed or cancelled quotations');
      // }

      const updatedQuotation = await this.prisma.saveQuates.update({
        where: { id },
        data: {
          ...updateQuotationDto,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
            }
          }
        }
      });

      return updatedQuotation;
    } catch (error) {
      throw error;
    }
  }

  // Update quotation ReValidation
  async updateQuotationReValidation(id: string, updateQuotationDto: Record<string, any>) {
    try {
      
      // Check if quotation exists
      const existingQuotation = await this.prisma.saveQuates.findUnique({
        where: { id }
      });

      if (!existingQuotation) {
        throw new NotFoundException('Quotation not found');
      }

      const updatedQuotation = await this.prisma.saveQuates.update({
        where: { id },
        data: {
          ...updateQuotationDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
            }
          }
        }
      });

      return updatedQuotation;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete quotation (change status to CANCELLED)
  async removeQuotation(id: string) {
    try {
      const quotation = await this.prisma.saveQuates.findUnique({
        where: { id }
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found');
      }

      const deletedQuotation = await this.prisma.saveQuates.delete({
        where: { id }
      });

      if(!deletedQuotation){
        throw new NotFoundException('Quotation not found');
      }else{
        return true;
      }
    } catch (error) {
      throw error;
    }
  }
  
  }




