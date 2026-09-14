import { Role, Lang, Currency, IsApproved } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  IsBoolean,
  Length
} from 'class-validator';

// ---------------- Customer DTO ----------------
export class CustomerDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyRegistionNumber?: string;

  @IsOptional()
  @IsString()
  vatNumber?: string;

  @IsOptional()
  @IsString()
  eoriNumber?: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  profitMargin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;
}

// ---------------- User DTO ----------------
export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  email: string;


  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Length(7, 20) // enforce valid phone length
  contactNo: string;

  @IsString()
  password: string; // already hashed before save

  @IsEnum(Lang)
  lang: Lang;

  @IsEnum(Role)
  role: Role;

  // Nested Customer
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer?: CustomerDto;
}

// ---------------- Approve Customer DTO ----------------
export class ApproveCustomerDto {
  @IsEnum(IsApproved)
  isApproved: IsApproved;
}
