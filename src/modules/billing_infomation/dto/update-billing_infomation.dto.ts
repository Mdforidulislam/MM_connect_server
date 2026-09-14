import { PartialType } from '@nestjs/swagger';
import { CreateBillingInformationDto } from './create-billing_infomation.dto';

export class UpdateBillingInfomationDto extends PartialType(CreateBillingInformationDto) {}
