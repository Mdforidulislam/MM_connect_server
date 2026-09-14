import { IsString, IsNumber, IsBoolean, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProviderProfiteAddDto {
  @IsMongoId()
  customerId: string;

  @IsNumber()
  @Type(() => Number)
  profiteMargin: number;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  Brand: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}