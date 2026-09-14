import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CompnayInformationService } from './compnay_information.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { ResponseService } from '@/utils/response';

@Controller('compnay-information')
export class CompnayInformationController {
  constructor(
    private readonly compnayInformationService: CompnayInformationService,
  ) {}

  // CREATE
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async create(
    @Body() createCompnayInformationDto: any,
    @Req() req: any,
  ) {
    const user = req.user;
    const res = await this.compnayInformationService.create(
      createCompnayInformationDto,
      user,
    );

    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Company information created successfully',
      data: res,
    });
  }

  // GET ALL
  @Get("primaryBusinessContact-all")
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAllprimaryBusinessContact(
    @Req() req: any,
    @Query() query: Record<string, any>,
  ) {
    const user = req.user; 
    const res = await this.compnayInformationService.findAllFindAllprimaryBusinessContact(user, query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information list fetched successfully',
      data: res,
    });
  }

  
  // GET ALL
  @Get("companyInformation-all")
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAllcompanyInformation(
    @Req() req: any,
    @Query() query: Record<string, any>,
  ) {
    const user = req.user; 
    const res = await this.compnayInformationService.findAllCompanyInformation(user, query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information list fetched successfully',
      data: res,
    });
  }


  // GET ONE
  @Get('primarybusinesscontact-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async primaryBusinessContactfindOne(@Param('id') id: string) {
    const res = await this.compnayInformationService.primaryBusinessContactFindOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Primarybusinesscontact-one fetched successfully',
      data: res,
    });
  }

  // GET ONE
  @Get('companyInformation-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async companyInformationfindOne(@Param('id') id: string) {
    const res = await this.compnayInformationService.companyInformationFindOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information fetched successfully',
      data: res,
    });
  }

  // UPDATE
  @Patch('companyInformation-update-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async companyInformationUpdate(
    @Param('id') id: string,
    @Body() updateCompnayInformationDto: any,
  ) {
    const res = await this.compnayInformationService.companyInformationUpdate(
      id,
      updateCompnayInformationDto,
    );
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information updated successfully',
      data: res,
    });
  }


  // UPDATE
  @Patch('primarybusinesscontacto-update-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async primarybusinesscontactOne(
    @Param('id') id: string,
    @Body() updateCompnayInformationDto: any,
  ) {
    const res = await this.compnayInformationService.primarybusinesscontactOne(
      id,
      updateCompnayInformationDto,
    );
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information updated successfully',
      data: res,
    });
  }

  // DELETE
  @Delete('primarybusinesscontacto-remove-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async primarybusinesscontactRemove(@Param('id') id: string) {
    const res = await this.compnayInformationService.primarybusinesscontactoRemove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information deleted successfully',
      data: res,
    });
  }

  // DELETE
  @Delete('companyInformation-remove-one/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async companyInformationRemove(@Param('id') id: string) {
    const res = await this.compnayInformationService.companyInformationRemove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Company information deleted successfully',
      data: res,
    });
  }

}
