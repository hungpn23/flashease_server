import {
  NumberValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class GoogleEnvVariables {
  @StringValidators()
  GOOGLE_CLIENT_ID: string;

  @NumberValidators()
  GOOGLE_CLIENT_SECRET: number;

  @StringValidators()
  GOOGLE_REDIRECT_URI: string;
}

// config factory
export default () => {
  validateConfig(process.env, GoogleEnvVariables);

  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  };
};
