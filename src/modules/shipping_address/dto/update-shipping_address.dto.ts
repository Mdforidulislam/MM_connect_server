import { PartialType } from '@nestjs/swagger';
import { CreateShippingAddressDto } from './create-shipping_address.dto';

export class UpdateShippingAddressDto extends PartialType(CreateShippingAddressDto) {}
