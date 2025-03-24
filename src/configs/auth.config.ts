import { StringValidators } from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import { StringValue } from 'ms';
import process from 'node:process';

export class AuthEnvVariables {
  @StringValidators()
  AUTH_JWT_SECRET: string;

  @StringValidators()
  AUTH_JWT_TOKEN_EXPIRES_IN: StringValue;

  @StringValidators()
  AUTH_REFRESH_SECRET: string;

  @StringValidators()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: StringValue;
}

export default () => {
  validateConfig(process.env, AuthEnvVariables);

  return {
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_JWT_TOKEN_EXPIRES_IN: process.env
      .AUTH_JWT_TOKEN_EXPIRES_IN as StringValue,
    AUTH_REFRESH_SECRET: process.env.AUTH_REFRESH_SECRET,
    AUTH_REFRESH_TOKEN_EXPIRES_IN: process.env
      .AUTH_REFRESH_TOKEN_EXPIRES_IN as StringValue,
  };
};
