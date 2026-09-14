import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpStatus, Query, Req, Res, InternalServerErrorException } from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseService } from '@/utils/response';
import { Request , Response } from 'express';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import { Public } from '../auth/auth.decorator';

@Controller('product')
export class ProductController {
  
  constructor(private readonly productService: ProductService) {}

  // create product list
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async create(@UploadedFile() file: Express.Multer.File) {
    const result = await this.productService.create(file);
    return ResponseService.formatResponse({
             statusCode: HttpStatus.OK,
             message: 'Brand create successfully',
             data: result,
    }); 
  }


  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAll(
  @Query() query: Record<string, any>,
  ) {
    const result = await this.productService.findAll(query);
    return ResponseService.formatResponse({
             statusCode: HttpStatus.OK,
             message: 'Brand get successfully',
             data: result,
    });
  }

  @Get('download-price-list')
  @Roles(Role.CUSTOMER)
  async downloadPriceList(@Query() query: Record<string, any>, @Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      const filePath = await this.productService.downloadPriceList(user, query) as any;

      const stats = fs.statSync(filePath.filePath);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filePath?.fileName}`);

      const fileStream = fs.createReadStream(filePath.filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        fs.unlink(filePath.filePath, (err) => {
          if (err) console.error('Failed to delete temp file:', err);
          else console.log('Deleted temp file:', filePath.filePath);
        });
      });

      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error while sending file.',
        });
      });
    } catch (error) {
      console.error('Error downloading price list:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error || 'Failed to download price list.',
      });
      
    }
  }


  @Roles(Role.CUSTOMER, Role.ADMIN)
  @Get('searcing-partnumber')
  async SearchingProductPartNumber(
    @Query() query: Record<string, any>,
    @Req() req: Request
  ) {
      const user: any = (req as any)?.user;
      const result = await this.productService.SearchingProductPartNumber(query, user);
      return ResponseService.formatResponse({
        statusCode: HttpStatus.OK,
        message: 'Product get successfully',
        data: result,
      });
  }


    
  @Get("searching-brand-name")
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async SearchingProductBrandName(@Query() query: Record<string, any>) {
    const result = await this.productService.SearchingProductBrandName(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Product get successfully',
      data: result,
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
   const result = await this.productService.findOne(id);
   return ResponseService.formatResponse({
             statusCode: HttpStatus.OK,
             message: 'Brand getOne successfully',
             data: result,
   });
  }

  
  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateProductDto: any) {
    const result = await this.productService.update(id, updateProductDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
      data: result,
    })
 }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.productService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Product deleted successfully',
      data: result,
    })
  }

};
