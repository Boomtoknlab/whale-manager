import { Request, Response, NextFunction } from 'express'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // requests per window
  
  // Clean up old entries
  if (store[key] && now > store[key].resetTime) {
    delete store[key]
  }
  
  // Initialize or increment counter
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[key].count++
  }
  
  // Check if limit exceeded
  if (store[key].count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
    })
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - store[key].count).toString(),
    'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
  })
  
  next()
}
