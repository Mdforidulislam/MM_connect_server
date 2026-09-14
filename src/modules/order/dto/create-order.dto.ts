import { Type } from 'class-transformer';
import { 
  IsOptional, IsString, IsArray, ValidateNested, 
  IsEnum, IsNumber, Min, IsNotEmpty 
} from 'class-validator';
import { Currency, OderType, OrderStatus } from '@prisma/client';

// ---------------- Product DTO ----------------
export class ProductDto {
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  qty: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

// ---------------- Generic Object DTO ----------------
export class DynamicObjectDto {
  [key: string]: any; // fallback for flexible JSON
}

// ---------------- SaveOrder DTO ----------------
export class CreateSaveOrderDto {
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerId: string;  

  @IsOptional()
  @IsString()
  agentEmail?: string;

  @IsOptional()
  @IsString()
  poReferenceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  productList: ProductDto[];

  @IsOptional()
  @Type(() => DynamicObjectDto)
  @ValidateNested()
  customerDetails?: DynamicObjectDto;

  @IsOptional()
  @Type(() => DynamicObjectDto)
  @ValidateNested()
  billingAddress?: DynamicObjectDto;

  @IsOptional()
  @Type(() => DynamicObjectDto)
  @ValidateNested()
  shippingAddress?: DynamicObjectDto;

  @IsOptional()
  @Type(() => DynamicObjectDto)
  @ValidateNested()
  deliveryAddress?: DynamicObjectDto;

  @IsOptional()
  @IsString()
  paymentTerms?: string;
}
