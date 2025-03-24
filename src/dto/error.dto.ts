export class ErrorDto {
  timestamp: string;
  statusCode: number;
  message: string;
  details?: ErrorDetailDto[];
}

export class ErrorDetailDto {
  property: string;
  code: string;
  message: string;
}
