import { StringValidators } from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class CloudfrontEnvVariables {
  @StringValidators()
  CLOUDFRONT_DISTRIBUTION_DOMAIN: string;

  @StringValidators()
  CLOUDFRONT_DISTRIBUTION_ID: string;

  @StringValidators()
  CLOUDFRONT_PRIVATE_KEY: string;

  @StringValidators()
  CLOUDFRONT_KEY_PAIR_ID: string;
}

// config factory
export default () => {
  validateConfig(process.env, CloudfrontEnvVariables);

  return {
    CLOUDFRONT_DISTRIBUTION_DOMAIN: process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN,
    CLOUDFRONT_DISTRIBUTION_ID: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
    CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
  };
};
