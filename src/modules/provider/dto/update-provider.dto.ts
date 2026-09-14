import { PartialType } from '@nestjs/swagger';
import { CreateProductUploadFileDto } from './create-provider.dto';


export class UpdateProviderDto extends PartialType(CreateProductUploadFileDto) {}
