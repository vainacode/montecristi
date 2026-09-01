/**
 * Security utilities: Anti-XSS, Anti-SSRF, and Input Sanitization
 */

/**
 * Sanitizes user inputs to prevent XSS, HTML Injection, and SQL Injection attempts.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip javascript: URIs
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '') // Strip inline event handlers like onload=, onerror=
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, "")   // Remove SQL comments
    .replace(/;/g, "")    // Remove statement terminators
    .replace(/\/\*/g, "") // Remove multi-line comments
    .replace(/\*\//g, "")
    .trim();
}

/**
 * Sanitizes an object of inputs (e.g. from req.json() or searchParams)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }
  return sanitized;
}

/**
 * Anti-SSRF: Validates if a URL is safe to fetch from server-side.
 * Rejects private IPs, local networks, metadata endpoints, and non-HTTP protocols.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost, link-local, and internal hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Block private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16)
    if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return false;
    }

    // Block cloud metadata services (AWS, GCP, Azure metadata IP)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
