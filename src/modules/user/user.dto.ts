import {
  EmailValidators,
  StringValidators,
} from '@/decorators/properties.decorator';

export class UpdateUserDto {
  @StringValidators({ minLength: 6 })
  username: string;

  @EmailValidators()
  email: string;

  @StringValidators({ minLength: 0 })
  bio?: string;
}

export class UploadAvatarResponseDto {
  avatarUrl: string;
}
