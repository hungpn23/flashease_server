import {
  EmailValidators,
  PasswordValidators,
  StringValidators,
} from '@/decorators/properties.decorator';

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

export class ChangePasswordDto {
  @PasswordValidators()
  oldPassword: string;

  @PasswordValidators()
  newPassword: string;

  @PasswordValidators()
  confirmPassword: string;
}

export class LoginResDto {
  accessToken: string;
  refreshToken: string;
}

export class RefreshResDto {
  accessToken: string;
}
