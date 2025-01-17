import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
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

  // ================= middlewares =================
  app.use(helmet());
  app.use(compression());

  // ================= configs =================
  const appUrl = configService.get('APP_URL', { infer: true });
  app.enableCors({
    origin: [appUrl, 'http://localhost:5173'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.enableVersioning({ type: VersioningType.URI });

  // ================= apply global components & logger  =================
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix(configService.get('APP_PREFIX', { infer: true }));

  app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(AuthService)));
  app.useGlobalGuards(new RoleGuard(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // ================= swagger =================
  secureApiDocs(app.getHttpAdapter());
  await swaggerConfig(app, configService);

  // ================= start app =================
  await app.listen(configService.get('APP_PORT', { infer: true }));
  logger.log(`🚀🚀🚀 App is running on: ${appUrl}`);
}

void bootstrap();
