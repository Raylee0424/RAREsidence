import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { AppModule } from './app.module.js';
import { UPLOADS_DIR } from './units/photo-upload.js';

async function bootstrap() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Security headers. Unit photos are embedded by the frontend, which runs
  // on a different origin, so allow cross-origin reads of resources.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Behind a proxy or load balancer, req.ip (used by rate limiting) is the
  // proxy's address unless Express is told to trust X-Forwarded-For.
  const trustProxy = config.get<string>('TRUST_PROXY');
  if (trustProxy) {
    app.set(
      'trust proxy',
      /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy,
    );
  }

  // Populates req.cookies so the JWT strategy can read the session cookie.
  app.use(cookieParser());

  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGIN', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`RAREsidence backend running on port ${port}`);
}
void bootstrap();
