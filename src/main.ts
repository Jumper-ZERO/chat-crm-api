import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger nest-pino
  app.useLogger(app.get(Logger));

  // I18n validations
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  // Validate decorators (isUnique)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // Authentication
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
