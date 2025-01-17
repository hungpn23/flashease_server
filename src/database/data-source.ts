import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { DatabaseNamingStrategy } from './name-strategy';

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE_NAME,

  synchronize: true,
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  namingStrategy: new DatabaseNamingStrategy(),

  seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
  factories: [__dirname + '/factories/**/*{.ts,.js}'],
  seedTracking: true,
} as MysqlConnectionOptions & DataSourceOptions & SeederOptions);
