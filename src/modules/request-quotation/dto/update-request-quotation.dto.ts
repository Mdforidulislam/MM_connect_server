import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './create-request-quotation.dto';


export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}
