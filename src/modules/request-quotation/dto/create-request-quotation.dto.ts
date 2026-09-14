import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsNumber, 
  IsObject,
  ValidateNested,
  IsNotEmpty,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuotaType, Currency } from '@prisma/client';

export class ProductItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  leadTimeUnite?: number;

  @IsString()
  @IsOptional()
  leadTimeType?: string;

  @IsString()
  @IsOptional()
  countryCodeOrigin?: string;

  @IsString()
  @IsOptional()
  uniteWeight?: string;
}

export class CreateQuotationDto {
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(QuotaType)
  @IsOptional()
  quationType?: QuotaType;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  @IsOptional()
  productList?: ProductItemDto[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  // For handling the client data structure
  @IsObject()
  @IsOptional()
  typeOfRequest?: string;

  @IsOptional()
  @IsString()
  email?: string;
	
  @IsOptional()
  @IsString()
  quataReferenceId: string;

}