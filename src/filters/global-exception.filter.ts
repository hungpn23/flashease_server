import { ErrorDetailDto, ErrorDto } from '@/dto/error.dto';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationError,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    let error: ErrorDto;

    this.logger.error(exception);

    if (exception instanceof UnprocessableEntityException) {
      // this exception is thrown from main.ts (ValidationPipe)
      error = this.handleUnprocessableEntityException(exception);
    } else if (exception instanceof HttpException) {
      error = this.handleHttpException(exception);
    } else {
      error = this.handleError(exception);
    }

    response.status(error.statusCode).json(error);
  }

  private handleUnprocessableEntityException(
    exception: UnprocessableEntityException,
  ) {
    const response = exception.getResponse() as { message: ValidationError[] };
    const statusCode = exception.getStatus();

    const errorResponse = {
      timestamp: new Date().toISOString(),
      statusCode,
      message: 'Validation failed',
      details: this.handleValidationErrors(response.message),
    };

    return errorResponse as ErrorDto;
  }

  private handleHttpException(exception: HttpException) {
    return {
      timestamp: new Date().toISOString(),
      statusCode: exception.getStatus(),
      message: exception.message,
    } as ErrorDto;
  }

  private handleError(error: any) {
    return {
      timestamp: new Date().toISOString(),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        error?.message || HttpErrorByCode[HttpStatus.INTERNAL_SERVER_ERROR],
    } as ErrorDto;
  }

  // ref: https://www.yasint.dev/flatten-error-constraints
  private handleValidationErrors(errors: ValidationError[]) {
    const errorDetails: ErrorDetailDto[] = [];
    for (const error of errors) {
      this.transformError(error, errorDetails);
    }
    return errorDetails;
  }

  private transformError(
    error: ValidationError,
    errorDetails: ErrorDetailDto[],
  ): void {
    if (error.children) {
      for (const child of error.children) {
        Object.assign(child, {
          property: `${error.property}.${child.property}`,
        });

        this.transformError(child, errorDetails);
      }
    }

    if (error.constraints) {
      for (const [code, message] of Object.entries(error.constraints)) {
        errorDetails.push({
          property: error.property,
          code,
          message,
        });
      }
    }
  }
}
