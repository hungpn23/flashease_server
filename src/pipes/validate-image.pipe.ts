import { ParseFilePipeBuilder } from '@nestjs/common';

type ValidateOptions = {
  required?: boolean;
  fileType?: string | RegExp;
  maxSize?: number;
};

export function validateImagePipe(options?: ValidateOptions) {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType: options?.fileType ?? /(jpeg|jpg|png)/ })
    .addMaxSizeValidator({ maxSize: options?.maxSize ?? 3 * 1000 * 1000 })
    .build({ fileIsRequired: options?.required ?? true });
}
