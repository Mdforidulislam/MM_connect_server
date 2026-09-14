
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateOurBrandDto {
  
  @IsString({ message: 'brandName must be a string' })
  Brand: string;

  @IsOptional()
  @IsString({ message: 'brandDescription must be a string' })
  validDate?: string;

  @IsOptional()
  @IsString({ message: 'brandDescription must be a string' })
  brandDescription?: string;

  @IsOptional()
  @IsUrl({}, { message: 'logo must be a valid URL' })
  logo?: string;

  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  websiteUrl?: string;
}

