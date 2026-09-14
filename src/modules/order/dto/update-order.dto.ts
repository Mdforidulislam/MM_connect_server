import { PartialType } from '@nestjs/mapped-types';
import { CreateSaveOrderDto } from './create-order.dto';


export class UpdateOrderDto extends PartialType(CreateSaveOrderDto) {}
 