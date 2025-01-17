import { IS_PUBLIC_KEY } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
