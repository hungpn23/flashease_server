import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { DatabaseNamingStrategy } from './name-strategy';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  poolSize: +process.env.POSTGRES_MAX_CONNECTIONS,
  ssl:
    process.env.POSTGRES_SSL_ENABLED === 'true'
      ? {
          rejectUnauthorized:
            process.env.POSTGRES_REJECT_UNAUTHORIZED === 'true',
          ca: process.env.POSTGRES_CA,
          key: process.env.POSTGRES_KEY,
          cert: process.env.POSTGRES_CERT,
        }
      : undefined,

  namingStrategy: new DatabaseNamingStrategy(),

  // * SeederOptions
  seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
  seedTracking: true,
  factories: [__dirname + '/factories/**/*{.ts,.js}'],
} as DataSourceOptions & SeederOptions);
