import { IS_REFRESH_TOKEN_KEY } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const RefreshToken = () => SetMetadata(IS_REFRESH_TOKEN_KEY, true);
