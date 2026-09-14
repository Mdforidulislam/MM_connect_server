import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderProfiteAddDto } from './create-profit-margin.dto';


export class UpdateProviderProfiteAddDto extends PartialType(CreateProviderProfiteAddDto) {}

