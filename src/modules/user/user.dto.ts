import {
  EmailValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';

export class UpdateUserDto {
  @StringValidators({ minLength: 6 })
  username: string;

  @EmailValidators()
  email: string;

  @StringValidators({ minLength: 0 })
  bio?: string;
}

@Expose()
export class UploadAvatarResponseDto {
  avatarUrl: string;
}
