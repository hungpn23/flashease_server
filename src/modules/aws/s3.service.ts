import { S3EnvVariables } from '@/configs/s3.config';
import { createUniqueFileName } from '@/utils/generate-file-name';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudfrontService } from './cloudfront.service';

// ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-cloudfront-signer/

@Injectable()
export class S3Service {
  private logger: Logger = new Logger(S3Service.name);

  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService<S3EnvVariables>,
    private cloudfrontService: CloudfrontService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('S3_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.configService.get('S3_SECRET_KEY', {
          infer: true,
        }),
      },
    });

    this.bucketName = this.configService.get('S3_BUCKET_NAME', { infer: true });
  }

  async uploadFile({ buffer, mimetype }: Express.Multer.File): Promise<string> {
    const fileName = createUniqueFileName();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype,
    });

    await this.s3Client.send(command);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      }),
    );

    await this.cloudfrontService.invalidateCache(fileName);
  }
}
