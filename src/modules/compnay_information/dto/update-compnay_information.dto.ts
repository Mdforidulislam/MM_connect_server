import { PartialType } from '@nestjs/swagger';
import { CreateCompnayInformationDto } from './create-compnay_information.dto';

export class UpdateCompnayInformationDto extends PartialType(CreateCompnayInformationDto) {}
