import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, UseInterceptors, UploadedFiles, BadRequestException, Req } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateOurBrandDto } from './dto/create-brand.dto';
import { ResponseService } from '@/utils/response';
import { ApiError } from '@/utils/api_error';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

@Post()
@Roles(Role.ADMIN)
@UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]),
    ParseFormDataInterceptor,
)
async create(
@Body() createBrandDto: CreateOurBrandDto,
@UploadedFiles() files: Record<string, Express.Multer.File[]>,
) {

const fileUrls = files?.logo?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);

if(!fileUrls || fileUrls.length === 0) {
    throw new BadRequestException('Logo file is required');
}

createBrandDto.logo = fileUrls[0];

const result = await this.brandService.create(createBrandDto);
      return ResponseService.formatResponse({
          statusCode: HttpStatus.OK,
          message: 'Brand created successfully',
          data: result,
      }); 
}

  @Get(":id")
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAll(
    @Query() query: Record<string, any>,
    @Param("id") id: string,
    @Req() req: any
  ) {

    if(!id) {
        throw new BadRequestException('Id is required');
    }
    const user = req.user;

    const result = await this.brandService.findAll(query, id, user);
    return ResponseService.formatResponse({
          statusCode: HttpStatus.OK,
          message: 'Brand retrieved successfully',
          data: result,
      }); 
  }

@Get(':id')
@Roles(Role.ADMIN, Role.CUSTOMER)
async  findOne(@Param('id') id: string) {
    const result = await this.brandService.findOne(id);

    return ResponseService.formatResponse({
          statusCode: HttpStatus.OK,
          message: 'Brand retrieved successfully',
          data: result,
      }); 
  }

 @Patch(':id')
 @Roles(Role.ADMIN)
 @UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]),
    ParseFormDataInterceptor,
 )
 async update(
  @Param('id') id: string,
   @Body() updateBrandDto: UpdateBrandDto,
   @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {

  const fileUrls = files?.logo?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
  if(fileUrls && fileUrls[0]?.length > 0) updateBrandDto.logo = fileUrls[0];
  const result = await this.brandService.update(id, updateBrandDto);

    return ResponseService.formatResponse({
          statusCode: HttpStatus.OK,
          message: 'Brand updated successfully',
          data: result,
    }); 
  }

  @Delete(':id')
  async  remove(@Param('id') id: string) {
      const result = await this.brandService.remove(id);     
      return ResponseService.formatResponse({
            statusCode: HttpStatus.OK,
            message: 'Brand deleted successfully',
            data: result,
        }); 
  }

}
