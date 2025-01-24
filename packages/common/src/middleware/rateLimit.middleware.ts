import rateLimit from 'express-rate-limit';

/**
 * createRateLimiter
 * This middleware will limit each IP to 100 requests per 15 minutes.
 * Adjust windowMs, max, etc. to your needs.
 */
export const createRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
