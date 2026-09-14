import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  HttpStatus,
  Request,
  Req
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';

@Controller('orders')
export class OrderController {
  
  constructor(private readonly orderService: OrderService) {}

  // Create new order
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async createOrder(@Body() createOrderDto: any, @Request() req: any) {
    const result = await this.orderService.createOrder(createOrderDto, req.user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Order created successfully',
      data: result
    });
  }

  // Get all orders with role-based filtering
  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAllOrders(@Query() query: Record<string, any>, @Request() req: any) {
    const result = await this.orderService.findAllOrders(query, req.user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: result
    });
  }

  // Get order by ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findOrderById(@Param('id') id: string, @Request() req: any) {
    const result = await this.orderService.findOrderById(id, req.user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Order retrieved successfully',
      data: result
    });
  }


  // Update order by ID
  @Patch(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async updateOrder(
    @Param('id') id: string, 
    @Body() updateOrderDto: any,
    @Request() req: any
  ) {
    const result = await this.orderService.updateOrder(id, updateOrderDto, req.user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Order updated successfully',
      data: result
    });
  }

  // Delete order (soft delete)
  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async deleteOrder(@Param('id') id: string, @Request() req: any) {
    const result = await this.orderService.deleteOrder(id, req.user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Order deleted successfully',
      data: result
    });
  }
}