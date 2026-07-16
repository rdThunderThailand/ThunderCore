export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): RateLimitInfo {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.expiresAt < now) {
    // New or expired record
    rateLimitMap.set(identifier, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return {
      limit,
      current: 1,
      remaining: limit - 1,
      resetTime: new Date(now + windowMs),
    };
  }

  // Increment existing record
  record.count += 1;
  return {
    limit,
    current: record.count,
    remaining: Math.max(0, limit - record.count),
    resetTime: new Date(record.expiresAt),
  };
}

// Cleanup function to prevent memory leaks in long-running processes
export function cleanUpRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.expiresAt < now) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanUpRateLimits, 5 * 60 * 1000); // Clean up every 5 minutes
}
