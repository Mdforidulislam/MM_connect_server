import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import  cookieParser from 'cookie-parser';
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

  app.enableCors({
    origin: [
      "http://10.0.50.157:3000",
      "https://mmconnect.co.uk",
      "https://www.mmconnect.co.uk", 
      'http://localhost:3000',
      'https://your-frontend-domain.com',
      'https://Bajram.code-commando.com',
      'https://www.darpm.site',
      'https://darpm.site',
      'https://Bajram-client.vercel.app',
      'https://bovila-frontend.vercel.app',
      'https://mm-connect-client.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept", "Access-Control-Allow-Origin"]
  });

  // app.use('/api/v1/webhook', express.raw({ type: 'application/json' }));

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpErrorFilter())

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 5000;
  

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
