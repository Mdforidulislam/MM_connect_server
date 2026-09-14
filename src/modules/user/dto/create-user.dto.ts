import { Role, Lang, Currency } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsBoolean,
  IsUrl
} from 'class-validator';
import { CustomerDto } from './create-customer.dto';


// ---------------- User DTO ----------------
export class createUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  contactNo: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(Lang)
  lang?: Lang;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer?: CustomerDto;
}
