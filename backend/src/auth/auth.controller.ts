import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators/index.js';
import { AUTH_COOKIE } from './auth.constants.js';
import { EmailThrottlerGuard } from './guards/email-throttler.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // httpOnly keeps the token away from page scripts; SameSite=Lax stops other
  // sites from sending it on cross-site form posts (basic CSRF protection).
  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        this.config.get<string>('COOKIE_SECURE') === 'true' ||
        process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  // Slows password guessing: 5 attempts per 15 minutes per client IP, and
  // separately 5 per 15 minutes per email address.
  @Public()
  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard, EmailThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, expiresAt, user } =
      await this.authService.login(loginDto);
    res.cookie(AUTH_COOKIE, accessToken, {
      ...this.cookieOptions(),
      expires: expiresAt,
    });
    // The token is deliberately not in the body.
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, this.cookieOptions());
  }
}
