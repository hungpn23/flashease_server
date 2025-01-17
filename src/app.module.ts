import {
  CacheInterceptor,
  CacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisStore, redisStore } from 'cache-manager-redis-yet';
import { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { DataSource } from 'typeorm';
import appConfig from './configs/app.config';
import authConfig from './configs/auth.config';
import cloudfrontConfig from './configs/cloudfront.config';
import databaseConfig from './configs/database.config';
import redisConfig, { RedisEnvVariables } from './configs/redis.config';
import s3Config from './configs/s3.config';
import throttlerConfig, {
  ThrottlerEnvVariables,
} from './configs/throttler.config';
import { DatabaseNamingStrategy } from './database/name-strategy';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { Modules as ApiModule } from './modules';
import { Milliseconds } from './types/branded.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [
        // load config factories to validate and transform the config values
        appConfig,
        databaseConfig,
        throttlerConfig,
        authConfig,
        redisConfig,
        s3Config,
        cloudfrontConfig,
      ],
      cache: true, // speed up the loading process
      expandVariables: true, // support variables in .env file
    }),

    TypeOrmModule.forRootAsync({
      // configure the DataSourceOptions.
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        if (!options) throw new Error('Invalid DataSourceOptions value');

        return await new DataSource({
          ...options,
          namingStrategy: new DatabaseNamingStrategy(),
        }).initialize();
      },
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            ignore: 'req,res,responseTime',
            singleLine: true,
          },
        },

        customReceivedMessage: (req: IncomingMessage) => {
          return `REQUEST(${req.id}) ${req.method} ${req.headers['host']}${req.url}`;
        },

        customSuccessMessage: (
          req: IncomingMessage,
          res: ServerResponse<IncomingMessage>,
          responseTime: number,
        ) => {
          return `RESPONSE(${req.id}) ${res.statusCode} - ${responseTime} ms`;
        },
      },
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ThrottlerEnvVariables>) => [
        {
          ttl: configService.get('THROTTLER_TTL', { infer: true }),
          limit: configService.get('THROTTLER_LIMIT', { infer: true }),
        },
      ],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<RedisEnvVariables>) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', { infer: true }),
            port: configService.get('REDIS_PORT', { infer: true }),
          },
          username: configService.get('REDIS_USERNAME', { infer: true }),
          password: configService.get('REDIS_PASSWORD', { infer: true }),
          ttl: 30000 as Milliseconds,
        });

        return {
          store: store as RedisStore as CacheStore,
        };
      },
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    ApiModule,
  ],

  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CacheInterceptor, // auto cache responses
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
