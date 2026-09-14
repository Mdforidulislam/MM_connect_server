import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ResponseService } from '@/utils/response';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import { FileService } from '../../helper/file.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';


@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fileService: FileService,
  ) { }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const result = await this.adminService.findAll(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Admins Found successfully',
      meta: result?.meta,
      data: result?.data,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    const result = await this.adminService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Admin Found successfully',
      data: result,
    });
  }


  @Patch(":id")
  @UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    ParseFormDataInterceptor
  )
  async update(
    @Body() updateAdminDto: any,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Param('id') id: string
  ) {

    let avatar: any | undefined;
    const uploadableFiles = files?.avatar;
    if (Array.isArray(uploadableFiles) && uploadableFiles.length > 0) {
       avatar = uploadableFiles.map((item) => `${process.env.SERVER_END_POINT}/files/${item.filename}`);
    }
    
    const result = await this.adminService.update(id,updateAdminDto, avatar);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Admin Updated successfully',
      data: result,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.adminService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Admin Deleted successfully',
      data: result,
    });
  }
}
