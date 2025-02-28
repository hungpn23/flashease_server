import {
  EmailValidators,
  PasswordValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';

export class LoginDto {
  @EmailValidators()
  email: string;

  @PasswordValidators()
  password: string;
}

export class RegisterDto {
  @StringValidators({ minLength: 6, maxLength: 20 })
  username: string;

  @EmailValidators()
  email: string;

  @PasswordValidators()
  password: string;

  @PasswordValidators()
  confirmPassword: string;
}

@Expose()
export class LoginResDto {
  accessToken: string;
  refreshToken: string;
}

@Expose()
export class RefreshResDto {
  accessToken: string;
}
