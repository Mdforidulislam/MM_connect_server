import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateProductUploadFileDto {
  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsBoolean()
  isComplate?: boolean;

  @IsOptional()
  @IsInt()
  percentage?: number;

  @IsString()
  uploadedBy: string;
}
