import {
  EmailValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';

export class UpdateUserDto {
  @StringValidators({ required: false })
  username?: string;

  @EmailValidators({ required: false })
  email?: string;

  @StringValidators({ required: false })
  bio?: string;
}

@Expose()
export class UploadAvatarResponseDto {
  avatarUrl: string;
}
