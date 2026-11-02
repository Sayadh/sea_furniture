import './config/bootstrap-env'; // must stay first: loads .env and prepares DATABASE_URL
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/filters/validation.factory';
import { StorageService } from './storage/storage.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Behind Nginx: trust the first proxy so req.ip / rate limiting use the real client IP.
  app.set('trust proxy', Number(config.get('TRUST_PROXY', 1)));
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '1mb' });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images in /uploads to be used by the frontend
      contentSecurityPolicy: false, // API returns JSON only; CSP is set by the frontend / Nginx
    }),
  );
  app.use(cookieParser());

  const origins = config
    .get<string>(
      'CORS_ORIGINS',
      config.get('NODE_ENV') === 'production'
        ? 'https://seafurniture.am,https://www.seafurniture.am'
        : 'http://localhost:3000',
    )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Uploaded images (stored on this server's disk)
  app.useStaticAssets(app.get(StorageService).uploadDir, {
    prefix: '/uploads/',
    maxAge: '365d',
    immutable: true,
    index: false,
    dotfiles: 'deny',
  });

  if (config.get('SWAGGER_ENABLED', 'true') === 'true') {
    const doc = new DocumentBuilder()
      .setTitle('sea_furniture API')
      .setDescription('Կահույքի վաճառքի և վերանորոգման կայքի API')
      .setVersion('1.0')
      .addCookieAuth('sf_access')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc));
  }

  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 4000); // cPanel/Passenger provides PORT
  // HOST can be left empty on cPanel/Passenger hosting (Passenger manages the socket)
  const host = config.get<string>('HOST');
  if (host) await app.listen(port, host);
  else await app.listen(port);
  logger.log(`API running on port ${port} (/api)`);
}

void bootstrap();
