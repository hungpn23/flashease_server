import { IS_REFRESH_TOKEN } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const RefreshToken = () => SetMetadata(IS_REFRESH_TOKEN, true);
