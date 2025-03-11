import { NO_CACHE } from '@/constants/index';
import { SetMetadata } from '@nestjs/common';

export const NoCache = () => SetMetadata(NO_CACHE, true);
