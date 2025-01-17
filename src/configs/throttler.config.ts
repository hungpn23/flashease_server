import { NumberValidators } from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class ThrottlerEnvVariables {
  @NumberValidators({ isInt: true, min: 1 })
  THROTTLER_TTL: number;

  @NumberValidators({ isInt: true, min: 1 })
  THROTTLER_LIMIT: number;
}

// config factory
export default () => {
  validateConfig(process.env, ThrottlerEnvVariables);

  return {
    THROTTLER_TTL: +process.env.THROTTLER_TTL,
    THROTTLER_LIMIT: +process.env.THROTTLER_LIMIT,
  };
};
