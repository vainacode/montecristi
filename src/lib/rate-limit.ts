/**
 * Simple in-memory rate limiter for Next.js Middleware.
 * 
 * Note: In a serverless environment (Vercel, Cloudflare Pages), this state is 
 * local to the execution instance. For a production-ready global rate limit, 
 * consider using Upstash Redis or a similar external store.
 */

interface RateLimit {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimit>();

// Clean up cache periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now > value.resetAt) {
        cache.delete(key);
      }
    }
  }, 300000);
}

export function rateLimit(identifier: string, limit: number = 60, windowMs: number = 60000) {
  const now = Date.now();
  const current = cache.get(identifier);

  if (!current || now > current.resetAt) {
    // New window or expired
    const newData = {
      count: 1,
      resetAt: now + windowMs,
    };
    cache.set(identifier, newData);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: newData.resetAt,
    };
  }

  if (current.count >= limit) {
    // Limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  // Increment count
  current.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}
