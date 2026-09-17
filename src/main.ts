import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import * as fs from 'fs';
import { HttpErrorFilter } from './utils/httpErrorFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'euhan-nest',
      logLevels: ['error', 'warn', 'fatal'],
      timestamp: true,
      json: true,
    }),
    rawBody: true,
  });

  // 1. Global Prefix সবার আগে সেট করো
  app.setGlobalPrefix('api/v1');

  // 2. Cookie parser এবং Filters যুক্ত করো
  app.use(cookieParser());
  app.useGlobalFilters(new HttpErrorFilter());

  // 3. CORS Configuration
  const allowedOrigins = [
    'https://www.mmconnect.co.uk',
    'https://mmconnect.co.uk',
    'https://mm-connect-client.onrender.com',
    'http://localhost:3000',
    'http://10.0.50.157:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Browser request, Postman, or exact allowed origin match
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // Exception না ছুড়ে false রিটার্ন করা ভালো
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Accept',
    ],
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 5000;

  // Swagger Specs
  const config = new DocumentBuilder()
    .setTitle('Mmengserv')
    .setDescription('The mmengserv API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

  await app.listen(port);
}

bootstrap();