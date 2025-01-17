import { CloudfrontEnvVariables } from '@/configs/cloudfront.config';
import { S3EnvVariables } from '@/configs/s3.config';
import { Milliseconds } from '@/types/branded.type';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudfrontService {
  private cloudfrontClient: CloudFrontClient;

  private cloudfrontDistributionDomain: string;
  private cloudfrontDistributionId: string;
  private cloudfrontPrivateKey: string;
  private cloudfrontKeyPairId: string;

  constructor(
    private configService: ConfigService<CloudfrontEnvVariables>,
    private s3Config: ConfigService<S3EnvVariables>,
  ) {
    this.cloudfrontClient = new CloudFrontClient({
      region: this.s3Config.get('S3_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.s3Config.get('S3_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.s3Config.get('S3_SECRET_KEY', {
          infer: true,
        }),
      },
    });

    this.cloudfrontDistributionDomain = this.configService.get(
      'CLOUDFRONT_DISTRIBUTION_DOMAIN',
      { infer: true },
    );

    this.cloudfrontDistributionId = this.configService.get(
      'CLOUDFRONT_DISTRIBUTION_ID',
      { infer: true },
    );

    this.cloudfrontPrivateKey = this.configService.get(
      'CLOUDFRONT_PRIVATE_KEY',
      { infer: true },
    );

    this.cloudfrontKeyPairId = this.configService.get(
      'CLOUDFRONT_KEY_PAIR_ID',
      { infer: true },
    );
  }

  getFileUrl(
    fileName: string,
    expiresIn = (24 * 60 * 60 * 1000) as Milliseconds,
  ): string {
    const url = `${this.cloudfrontDistributionDomain}/${fileName}`;
    const dateLessThan = new Date(Date.now() + expiresIn).toISOString();

    return getSignedUrl({
      url,
      dateLessThan,
      privateKey: this.cloudfrontPrivateKey,
      keyPairId: this.cloudfrontKeyPairId,
    });
  }

  // see: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudfront/command/CreateInvalidationCommand/
  async invalidateCache(fileName: string) {
    const command = new CreateInvalidationCommand({
      DistributionId: this.cloudfrontDistributionId,
      InvalidationBatch: {
        CallerReference: fileName, // unique caller avoid request duplication
        Paths: {
          Quantity: 1,
          Items: [`/${fileName}`],
        },
      },
    });

    await this.cloudfrontClient.send(command);
  }
}
