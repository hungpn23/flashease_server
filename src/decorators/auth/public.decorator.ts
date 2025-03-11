import { IS_PUBLIC } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC, true);
