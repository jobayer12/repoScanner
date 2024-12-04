import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/http-exception-filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const options = new DocumentBuilder()
    .setTitle('Scanner')
    .setDescription('Github Repository Scanner')
    .setVersion('1.0-beta')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  const configService: ConfigService = app.get(ConfigService);
  console.log(configService.get('rabbitmq'))
  await app.listen(configService.get('common.port'));
}
bootstrap().catch((r) => console.log(r));
