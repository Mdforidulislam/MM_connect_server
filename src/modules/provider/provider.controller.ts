import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { CreateProductUploadFileDto } from './dto/create-provider.dto';
import { ResponseService } from '@/utils/response';

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
 async create(@Body() createProviderDto: any) {
    const result = await  this.providerService.create(createProviderDto);
    return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider create successfully', data: result });
 }

@Get("local")
 async findAll(
  @Query() query: Record<string, any>,
 ) {
  const result = await this.providerService.findAll(query);
  return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider get successfully', data: result });
}

@Get("api")
 async findAllAPIProvider(
  @Query() query: Record<string, any>,
 ) {
  const result = await this.providerService.findAllApiProvider(query);
  return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider get successfully', data: result });
}


@Get(":id")
 async findOne(@Param('id') id: string) {
  const result = await this.providerService.findOne(id);
  return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider get successfully', data: result });
}


  @Patch('local/:id')
  async LocalProviderUpdate(@Param('id') id: string, @Body() updateProviderDto: any) {

    const result = await  this.providerService.updateLocal(id, updateProviderDto);
    return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider updated successfully', data: result });
  }

  @Patch('api/:id')
  async ApiProviderUpdate(@Param('id') id: string, @Body() updateProviderDto: any) {
    const result = await  this.providerService.updateApi(id, updateProviderDto);
    return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider updated successfully', data: result });
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    const result = await this.providerService.remove(id);
    return ResponseService.formatResponse({ statusCode: HttpStatus.OK, message: 'Provider deleted successfully', data: result });
  }
}
