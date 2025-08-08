import { Request, Response, NextFunction } from 'express'

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', error)
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details
    })
  }
  
  // Database errors
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    })
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
}
