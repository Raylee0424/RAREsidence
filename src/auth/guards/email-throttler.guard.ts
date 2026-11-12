import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Rate limits by the email being tried instead of the client IP. IPs can be
// rotated (or spoofed via X-Forwarded-For when Next.js is exposed directly),
// but this still caps guesses against any single account. Use alongside the
// IP-based ThrottlerGuard; both read the route's @Throttle limits.
@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const body = req.body as { email?: unknown } | undefined;
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    return Promise.resolve(`login-email:${email}`);
  }
}
