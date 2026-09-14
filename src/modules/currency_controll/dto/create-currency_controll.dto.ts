import { IsNumber, IsOptional } from "class-validator";

export class CreateCurrencyControllDto {
   @IsNumber()
  @IsOptional()
  USD?: number;

  @IsNumber()
  @IsOptional()
  GBP?: number;

  @IsNumber()
  @IsOptional()
  EUR?: number;
}
