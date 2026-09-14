import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateProviderProfiteAddDto } from './create-profit-margin.dto';


export class CreateManyProviderProfiteAddDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProviderProfiteAddDto)
  data: CreateProviderProfiteAddDto[];
}
