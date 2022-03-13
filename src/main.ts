import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST'],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(8000);
}
bootstrap();
