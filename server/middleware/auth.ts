import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }
  
  next()
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // User might or might not be authenticated
  next()
}
