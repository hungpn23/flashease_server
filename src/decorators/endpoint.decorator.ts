import { MAX_FILES_UPLOAD } from '@/constants';
import { ErrorDto } from '@/dto/error.dto';
import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ClassConstructor } from 'class-transformer';
import { STATUS_CODES } from 'node:http';
import { Public } from './auth/public.decorator';

const DEFAULT_STATUS_CODE = HttpStatus.OK;

export type EndpointOptions = {
  type?: Type<any>;
  isPublic?: boolean;
  summary?: string; // for swagger documentation
  description?: string; // for success response
  statusCode?: HttpStatus;
  errorStatusCodes?: HttpStatus[];
  isPaginated?: boolean;
  params?: ApiParamOptions[];
};

export function ApiEndpoint(options: EndpointOptions = {}): MethodDecorator {
  const { description = 'OK', statusCode = DEFAULT_STATUS_CODE } = options;

  const decorators: MethodDecorator[] = [];

  // for runtime and serialize response
  decorators.push(SerializeOptions({ type: options?.type }));
  decorators.push(HttpCode(statusCode));

  if (options?.summary)
    decorators.push(ApiOperation({ summary: options?.summary }));

  if (options?.params) {
    options.params.forEach((param) => {
      decorators.push(
        ApiParam({
          required: param.required ?? true,
          ...param,
        }),
      );
    });
  }

  decorators.push(options?.isPublic ? Public() : ApiBearerAuth());

  decorators.push(
    options?.isPaginated
      ? ApiPaginatedResponse(options?.type)
      : ApiOkResponse({
          type: options?.type,
          description,
        }),
  );

  handleErrorResponse(options?.errorStatusCodes, options?.isPublic).forEach(
    (statusCode) => {
      decorators.push(
        ApiResponse({
          type: ErrorDto,
          status: statusCode,
          description: STATUS_CODES[statusCode],
        }),
      );
    },
  );

  return applyDecorators(...decorators);
}

export function ApiFile(fileName: string): MethodDecorator {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fileName)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
        required: [fileName],
      },
    }),
  );
}

export function ApiArrayFiles<TClass>(
  fileName: string,
  extraModels: ClassConstructor<TClass>,
  maxCount: number = MAX_FILES_UPLOAD,
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fileName, maxCount)),
    ApiConsumes('multipart/form-data'),
    ApiExtraModels(extraModels),
    ApiBody({
      required: true,
      schema: {
        allOf: [
          {
            properties: {
              [fileName]: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
            required: [fileName],
          },
          {
            $ref: getSchemaPath(extraModels),
          },
        ],
      },
    }),
  );
}

function handleErrorResponse(
  errorStatusCodes: HttpStatus[] = [],
  isPublic: boolean = false,
) {
  const errorCodes = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  errorCodes.push(...errorStatusCodes);

  if (isPublic)
    return errorCodes.filter((code) => code !== HttpStatus.UNAUTHORIZED);

  return errorCodes;
}

function ApiPaginatedResponse<DataDto extends Type<unknown>>(
  data: DataDto,
): MethodDecorator {
  // ref: https://aalonso.dev/blog/2021/how-to-generate-generics-dtos-with-nestjsswagger-422g
  return applyDecorators(
    ApiExtraModels(OffsetPaginatedDto, data),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(OffsetPaginatedDto),
          },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(data) },
              },
            },
          },
        ],
      },
    }),
  );
}
