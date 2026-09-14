import { IsString, IsOptional, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class CreateShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  state_province?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsOptional()
  deliveryPreference?: string;

  @IsPhoneNumber(null) // accepts any region
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsOptional()
  customerId: string;
}
