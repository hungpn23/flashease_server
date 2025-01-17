import { AuthError } from '@/constants/index';
import { BadRequestException } from '@nestjs/common';

export class AuthException extends BadRequestException {
  constructor(message?: AuthError) {
    super(message);
  }
}
