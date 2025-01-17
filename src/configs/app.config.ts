import { Environment } from '@/constants';
import {
  EnumValidators,
  NumberValidators,
  StringValidators,
  UrlValidators,
} from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class AppEnvVariables {
  @EnumValidators(Environment)
  NODE_ENV: Environment;

  @StringValidators()
  APP_NAME: string;

  @NumberValidators({ isInt: true, min: 1, max: 65535 })
  APP_PORT: number;

  @UrlValidators({ require_tld: false }) // to allow localhost
  APP_URL: string;

  @StringValidators()
  APP_PREFIX: string;
}

// config factory
export default () => {
  validateConfig(process.env, AppEnvVariables);

  return {
    NODE_ENV: process.env.NODE_ENV as Environment,
    APP_NAME: process.env.APP_NAME,
    APP_PORT: +process.env.APP_PORT,
    APP_URL: process.env.APP_URL,
    APP_PREFIX: process.env.API_PREFIX,
  };
};
