import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginatedResponse<DataDto extends Type<unknown>>(
  data: DataDto,
): MethodDecorator {
  // see: https://aalonso.dev/blog/2021/how-to-generate-generics-dtos-with-nestjsswagger-422g
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
