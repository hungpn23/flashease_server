import metadata from '@/metadata';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppEnvVariables } from './app.config';

export default async function swaggerConfig(
  app: INestApplication,
  configService: ConfigService<AppEnvVariables>,
) {
  await SwaggerModule.loadPluginMetadata(metadata);

  const appName = configService.get('APP_NAME', { infer: true });

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(`### description for ${appName} `)
    .addServer(
      configService.get('APP_URL', { infer: true }),
      'Application Server',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: appName,
    swaggerOptions: {
      // see: https://trilon.io/blog/nestjs-swagger-tips-tricks#preauth-alternatives
      persistAuthorization: true,
    },
  });
}
