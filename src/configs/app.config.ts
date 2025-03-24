import { Environment } from '@/constants';
import {
  EnumValidators,
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

  @UrlValidators({ require_tld: false }) // to allow localhost
  APP_HOST: string;

  @StringValidators()
  APP_PREFIX: string;
}

export default () => {
  validateConfig(process.env, AppEnvVariables);

  return {
    NODE_ENV: process.env.NODE_ENV as Environment,
    APP_NAME: process.env.APP_NAME,
    APP_HOST: process.env.APP_HOST,
    APP_PREFIX: process.env.API_PREFIX,
  };
};
