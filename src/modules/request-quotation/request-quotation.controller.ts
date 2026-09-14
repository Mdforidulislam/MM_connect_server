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
  Req
} from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';
import { QuotationService } from './request-quotation.service';
import { CreateQuotationDto } from './dto/create-request-quotation.dto';
import { UpdateQuotationDto } from './dto/update-request-quotation.dto';



@Controller('quotations')
export class QuontationController {
  constructor(private readonly orderService: QuotationService) {}

  // Create new quotation (handles both REQUEST_QUOTATION and NORMAL_QUOTATION)
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async createQuotation(
    @Req() req,
    @Body() createQuotationDto: any
  ) {

    const user = req?.user;
    const result = await this.orderService.createQuotation(user,createQuotationDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Quotation created successfully',
      data: result
    });
  }

  // Get all quotations with optional filtering
  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAllQuotations(@Query() query: Record<string, any>, @Req() req: any) {
    const user = req.user;
    const result = await this.orderService.findAllQuotations(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Quotations retrieved successfully',
      data: result
    });
  }

  // Get quotation by ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findQuotationById(@Param('id') id: string) {
    const result = await this.orderService.findQuotationById(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Quotation retrieved successfully',
      data: result
    });
  }

  // Update quotation by ID
  @Patch(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async updateQuotation(
    @Param('id') id: string, 
    @Body() updateQuotationDto: any
  ) {
    const result = await this.orderService.updateQuotation(id, updateQuotationDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Quotation updated successfully',
      data: result
    });
  }

    // Update quotation by ID
  @Patch('re-validation/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async updateQuotationReValidation(
    @Param('id') id: string, 
    @Body() updateQuotationDto: UpdateQuotationDto
  ) {
    const result = await this.orderService.updateQuotationReValidation(id, updateQuotationDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Quotation updated successfully',
      data: result
    });
  }


    // Delete quotation (soft delete - change status to CANCELLED)
  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async removeQuotation(@Param('id') id: string) {
    const result = await this.orderService.removeQuotation(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Quotation deleted successfully',
      data: result
    });
  }
}