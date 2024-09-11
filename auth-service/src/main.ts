import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/http-exception-filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuard } from './common/guards/AuthGuard';

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
  // app.useGlobalGuards(new AuthGuard());
  await app.listen(3000);
}
bootstrap();
