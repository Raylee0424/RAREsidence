import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation.js';
import type { ServerResponse } from 'http';
import { UPLOADS_DIR } from './units/photo-upload.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { UnitsModule } from './units/units.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Limits are opted into per route with @UseGuards(ThrottlerGuard),
    // so admin screens aren't throttled. Counts are per client IP.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
      errorMessage:
        'Too many requests. Please wait a few minutes and try again.',
    }),
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: '/uploads',
      serveStaticOptions: {
        // Stop browsers from guessing a different type than the extension says.
        setHeaders: (res: ServerResponse) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
        },
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UnitsModule,
    BookingsModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
