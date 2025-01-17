import {
  EmailValidators,
  PasswordValidators,
} from '@/decorators/properties.decorator';
import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthReqDto {
  @EmailValidators()
  email: string;

  @PasswordValidators()
  password: string;
}

@Expose()
export class AuthResDto {
  accessToken: string;
  refreshToken: string;
}

@Expose()
export class LoginResDto extends AuthResDto {}

@Expose()
export class RefreshResDto extends PickType(AuthResDto, [
  'accessToken',
] as const) {}
