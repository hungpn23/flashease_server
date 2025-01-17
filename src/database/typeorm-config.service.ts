import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { DatabaseEnvVariables } from '../configs/database.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<DatabaseEnvVariables>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('DATABASE_TYPE', { infer: true }),
      host: this.configService.get('DATABASE_HOST', { infer: true }),
      port: +this.configService.get('DATABASE_PORT', { infer: true }),
      username: this.configService.get('DATABASE_USERNAME', { infer: true }),
      password: this.configService.get('DATABASE_PASSWORD', { infer: true }),
      database: this.configService.get('DATABASE_DATABASE_NAME', {
        infer: true,
      }),

      synchronize: true,
      logging: true,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../**/migrations/**/*.{.ts,.js}'],
    } as MysqlConnectionOptions as TypeOrmModuleOptions;
  }
}
