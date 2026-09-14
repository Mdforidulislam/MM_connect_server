import { PartialType } from '@nestjs/swagger';
import { CreateCurrencyControllDto } from './create-currency_controll.dto';

export class UpdateCurrencyControllDto extends PartialType(CreateCurrencyControllDto) {}
