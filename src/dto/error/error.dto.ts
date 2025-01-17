import { OmitType } from '@nestjs/swagger';
import { ErrorDetailDto } from './error-detail.dto';

export class ErrorDto {
  timestamp: string;
  statusCode: number;
  message: string;
  details?: ErrorDetailDto[];
}

export class CommonErrorDto extends OmitType(ErrorDto, ['details']) {}
