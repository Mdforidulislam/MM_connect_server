import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, OderType, Currency, Role } from '@prisma/client';
import { PrismaService } from '@/helper/prisma.service';
import QueryBuilder from '@/utils/queryBuilder';
import { sendEmailWithSendGrid } from '@/email/sendGrid';
import { generateAdminOrderNotificationEmail, generateOrderConfirmationEmail } from '@/email/template/order.template.notification';
import { sendEmailWithHostinger } from '@/email/email.nodemail.config';

interface UserContext {
  id: string;
  role: Role;
  customerId?: string;
}

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

async convertCurrency(
  currencyRates: any = "USD",
  fromCurrency: string = "USD",
  toCurrency: string,
  amount: number
): Promise<number> {

  const fromRate = currencyRates[fromCurrency];
  const toRate = currencyRates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Invalid currency conversion: ${fromCurrency} → ${toCurrency}`);
  }

  // Convert amount → base → target currency
  const converted = (amount / fromRate) * toRate;
  return Number(converted.toFixed(2));
}


  // Create new order
  async createOrder(createOrderDto: any, user: UserContext) {
    try {
   
    const findCustomer = await this.prisma.customer.findUnique({
        where:{
          userId: user?.id
        }
    });
      
    if(!findCustomer){
        throw new NotFoundException('Customer not found');
    }

    const productCurrency = createOrderDto.productList[0].currency;
    const customerCurrency = findCustomer.currency;
    const shippingCost = findCustomer.shippingCost;
    let finalShippingCost = shippingCost;

    /**
     * -------------------------------------------------------
     * converting shipping cost to customer currency
     * -------------------------------------------------------
     */
    if (productCurrency.toLowerCase() !== customerCurrency.toLowerCase()) {
      const [currencyConfig] = await this.prisma.currencyControll.findMany({});
      finalShippingCost = await this.convertCurrency(
        currencyConfig,
        customerCurrency,    
        productCurrency,   
        shippingCost          
      );
    }
    
    const orderId = await this.generateInternalReference();
    const order = await this.prisma.saveOrder.create({
        data:{
          ...createOrderDto,
          customerId: findCustomer?.id,
          orderId: orderId
        } as any
    });

    const findTeamMember = await this.prisma.teamMember.findFirst({
      where:{
        customerId: user?.id 
      } as any
    });



    if(order){
        /**
         * -------------------------------------------------------
         * sending email to customer with  order details 
         * -------------------------------------------------------
         */

      interface ShippingAddress{
          type: string;
          [key:string]: any
        }

      const templateEmail = findTeamMember?.email  || findCustomer?.companyEmail
       
        const shippingAddresss = order?.shippingAddress as ShippingAddress;
        const {html, text , subject} = generateOrderConfirmationEmail({
                          customerName: findCustomer.companyName,
                          customerEmail: templateEmail,
                          orderReference: orderId,
                          shippingCost: finalShippingCost,
                          shippmentAddress: shippingAddresss.type,
                          productList: order?.productList as any,
                          customerReference: createOrderDto.poReferenceId
        });

        // sending email to customer
                         await sendEmailWithHostinger({
                            to: templateEmail || "",
                            subject: subject,
                            text: text,
                            htmlContent: html
                         })

        /**
           * -------------------------------------------------------
           * sending email to admin with order details
           * -------------------------------------------------------
        */
       const {html : htmlAdmin, text: textAdmin , subject: subjectAdmin} =    generateAdminOrderNotificationEmail({ 
                        customerName: findCustomer.companyName,
                        customerEmail: templateEmail || "",
                        orderReference: orderId,  
                        productList: order?.productList as any,
                        poNumber: createOrderDto.poReferenceId,
                        shippmentAddress: shippingAddresss.type,
                        currency: createOrderDto.currency || Currency.USD,
                        shippingCost: finalShippingCost
          });

                      //  sending email to admin 
                      const admin = await this.prisma.user.findFirst({
                            where:{
                              role: Role.ADMIN
                            }
                      });

                        await sendEmailWithHostinger({
                            to: admin?.email || "",
                            subject: subjectAdmin,
                            text: textAdmin,
                            htmlContent: htmlAdmin
                        });
      }
   
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create order: ${error}`);
    }
  }

  // Find all orders with role-based access
  async findAllOrders(query: Record<string, any>, user: UserContext) {
    try {

      const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};

    const userRole = user?.role === "CUSTOMER"
    
    const customer = await this. prisma.customer.findUnique({
      where: {
        userId: user?.id
      }
    });

    const queryBuilder = new QueryBuilder( query,this.prisma.saveOrder);
    const result = await queryBuilder
      .search(["poReferenceId","poReferenceId","agentEmail","orderId", "customer.fullName"])
      .filter(["status","poReferenceId","agentEmail"])
      .sort()
      .rawFilter({
        ...(userRole ? { customerId: customer?.id } : {})
      })
      .paginate()
      .fields()
      .filterByRange([{
        field:"createdAt",
        dataType:"date",
        maxQueryKey:"maxQueryKey",
        minQueryKey:"minQueryKey",
      }])
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
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
    
    } catch (error) {
      throw new BadRequestException(`Failed to fetch orders: ${error}`);
    }
  }

  // Find order by ID
  async findOrderById(id: string, user: UserContext) {
    try {
      const order = await this.prisma.saveOrder.findUnique({
        where: { id },
        include: {
           customer: {
              include:{
                registeredBusinessAddress : true,
                primaryBusinessContact    : true,
                shippingAddresses         : true,
                BillingInformation        : true,
                companyInformation        : true,
              }
        },
        }
      });

      // this blog for product infomation add here 

      

      return order;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch order: ${error}`);
    }
  }

  // Update order
  async updateOrder(id: string, updateOrderDto: UpdateOrderDto, user: UserContext) {
    try {

      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Valid order ID is required');
      }

      // Check if order exists and validate access
      const existingOrder = await this.prisma.saveOrder.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const updateOrder = await this.prisma.saveOrder.update({
        where:{id},
        data:{
          ...updateOrderDto
        }as any
      });

      return updateOrder;
    
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update order: ${error}`);
    }
  }

  // ----------------------------------------------
  // Soft delete order
  // ----------------------------------------------
  async deleteOrder(id: string, user: UserContext) {
    try {
      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Valid order ID is required');
      }

      // Check if order exists and validate access
      const existingOrder = await this.prisma.saveOrder.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Check access permissions
      if (user.role === Role.CUSTOMER && existingOrder.customerId !== (user.customerId || user.id)) {
        throw new ForbiddenException('Access denied to delete this order');
      }


      // Soft delete by updating status
      const deletedOrder = await this.prisma.saveOrder.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true
            }
          }
        }
      });

      return {
        ...deletedOrder,
        message: 'Order has been cancelled successfully'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete order: ${error}`);
    }
  }

  // Helper method to generate internal reference ID
  // -------------------------------
  // Generate a unique internal reference
  // -------------------------------
  private async generateInternalReference(): Promise<string> {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    while (true) {
      // Generate 4-character random code
      let code = '';
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
      }
      const ref = `MMC_${code}`;

      // Check if it already exists in the database
      const existing = await this.prisma.saveOrder.findUnique({
        where: { orderId: ref } as any,
      });

      if (!existing) {
        return ref; 
      }
    }
  }

}