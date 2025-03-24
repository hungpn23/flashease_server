import TypeOrmCustomLogger from '@/utils/typeorm-logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DatabaseEnvVariables } from '../configs/database.config';
import { DatabaseNamingStrategy } from './name-strategy';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<DatabaseEnvVariables>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      // TypeOrmModuleOptions
      retryAttempts: 1,

      // PostgresConnectionCredentialsOptions
      type: 'postgres',
      host: this.configService.get('POSTGRES_HOST', { infer: true }),
      username: this.configService.get('POSTGRES_USER', { infer: true }),
      database: this.configService.get('POSTGRES_DB', { infer: true }),
      password: this.configService.get('POSTGRES_PASSWORD', {
        infer: true,
      }),

      // BaseDataSourceOptions
      synchronize: this.configService.get('POSTGRES_SYNCHRONIZE', {
        infer: true,
      }),
      logging: this.configService.get('POSTGRES_LOGGING', { infer: true }),
      logger: TypeOrmCustomLogger.getInstance(
        'default',
        this.configService.get('POSTGRES_LOGGING', { infer: true })
          ? ['error', 'warn', 'query', 'schema']
          : ['error', 'warn'],
      ),
      poolSize: this.configService.get('POSTGRES_MAX_CONNECTIONS', {
        infer: true,
      }),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../**/migrations/**/*.{.ts,.js}'],

      // ref: https://node-postgres.com/features/ssl
      ssl: this.configService.get('POSTGRES_SSL_ENABLED', { infer: true })
        ? {
            rejectUnauthorized: this.configService.get(
              'POSTGRES_REJECT_UNAUTHORIZED',
              {
                infer: true,
              },
            ),
            ca: this.configService.get('POSTGRES_CA', { infer: true }),
            key: this.configService.get('POSTGRES_KEY', { infer: true }),
            cert: this.configService.get('POSTGRES_CERT', { infer: true }),
          }
        : false,

      namingStrategy: new DatabaseNamingStrategy(),
    } as TypeOrmModuleOptions;
  }
}
