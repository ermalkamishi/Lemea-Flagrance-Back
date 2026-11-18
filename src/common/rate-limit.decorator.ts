import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

const MINUTE = 60_000;

/**
 * Per-IP rate limit for a single route.
 * Only routes decorated with this are limited — browsing endpoints are not.
 * The client IP comes from req.ip ('trust proxy' is enabled in main.ts for Railway).
 */
export const RateLimit = (limit: number, minutes: number) =>
  applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit, ttl: minutes * MINUTE } }),
  );
