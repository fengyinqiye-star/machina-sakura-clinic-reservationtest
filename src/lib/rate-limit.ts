const rateMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateMap.forEach((value, key) => {
      if (now > value.resetAt) {
        rateMap.delete(key);
      }
    });
  }, 60 * 1000);
}
