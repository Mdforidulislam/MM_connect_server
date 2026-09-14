import { PartialType } from '@nestjs/swagger';
import {  CreateOurBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends PartialType(CreateOurBrandDto) {}
