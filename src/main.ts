import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ValidationError } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppEnvVariables } from './configs/app.config';
import swaggerConfig from './configs/swagger.config';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthService } from './modules/auth/auth.service';
import { secureApiDocs } from './utils/secure-docs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // buffering logs before nestjs-pino logger ready
  });
  const configService = app.get(ConfigService<AppEnvVariables, true>);
  const appHost = configService.get('APP_HOST', { infer: true });
  const logger = app.get(Logger);

  app.use(helmet());
  app.use(compression());
  app.useLogger(logger);

  app.enableCors({
    origin: [appHost],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.enableVersioning({ type: VersioningType.URI });

  app.setGlobalPrefix(configService.get('APP_PREFIX', { infer: true }));

  app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(AuthService)));
  app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
  app.useGlobalGuards(app.get(ThrottlerGuard));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // auto transform payload to DTO instance
      whitelist: true, // more strict
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  secureApiDocs(app.getHttpAdapter());
  await swaggerConfig(app, configService);

  await app.listen(3001);
  logger.log(`🚀🚀🚀 App is running on: ${appHost}:3001`);
}

void bootstrap();
