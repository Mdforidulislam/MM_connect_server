import { IsString, IsOptional, IsEmail, IsNumber, IsEnum } from 'class-validator';

export class CreateBillingInformationDto {
  
  @IsOptional()
  @IsString()
  accountPaybleContact?: string;

  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @IsOptional()
  @IsNumber()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsOptional()
  @IsString()
  shippingResponsibility?: string;

  @IsOptional()
  @IsString()
  shippingServiceType?: string;

}
