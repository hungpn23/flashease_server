import {
  NumberValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class RedisEnvVariables {
  @StringValidators()
  REDIS_HOST: string;

  @NumberValidators()
  REDIS_PORT: number;

  @StringValidators()
  REDIS_USERNAME: string;

  @StringValidators()
  REDIS_PASSWORD: string;

  @StringValidators()
  REDIS_DEFAULT_PASSWORD: string;

  @StringValidators()
  REDIS_PERMISSIONS: string;
}

// config factory
export default () => {
  validateConfig(process.env, RedisEnvVariables);

  return {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: +process.env.REDIS_PORT,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DEFAULT_PASSWORD: process.env.REDIS_DEFAULT_PASSWORD,
    REDIS_PERMISSIONS: process.env.REDIS_PERMISSIONS,
  };
};
