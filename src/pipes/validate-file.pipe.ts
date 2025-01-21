import { ParseFilePipeBuilder } from '@nestjs/common';

type ValidateOptions = {
  required?: boolean;
  fileType?: string | RegExp;
  maxSize?: number;
};

export function validateImagePipe(options?: ValidateOptions) {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType: options?.fileType ?? 'image/jpeg' })
    .addMaxSizeValidator({ maxSize: options?.maxSize ?? 3 * 1000 * 1000 })
    .build({ fileIsRequired: options?.required ?? true });
}

export function validateXlsxPipe(options?: ValidateOptions) {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType:
        options?.fileType ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    .addMaxSizeValidator({ maxSize: options?.maxSize ?? 3 * 1000 * 1000 })
    .build({ fileIsRequired: options?.required ?? true });
}
