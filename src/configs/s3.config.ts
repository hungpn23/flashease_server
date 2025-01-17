import { StringValidators } from '@/decorators/properties.decorator';
import { validateConfig } from '@/utils/validate-config';
import process from 'node:process';

export class S3EnvVariables {
  @StringValidators()
  S3_BUCKET_NAME: string;

  @StringValidators()
  S3_REGION: string;

  @StringValidators()
  S3_ACCESS_KEY: string;

  @StringValidators()
  S3_SECRET_KEY: string;

  @StringValidators()
  CLOUDFRONT_DISTRIBUTION_DOMAIN: string;
}

// config factory
export default () => {
  validateConfig(process.env, S3EnvVariables);

  return {
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    CLOUDFRONT_DISTRIBUTION_DOMAIN: process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN,
  };
};
