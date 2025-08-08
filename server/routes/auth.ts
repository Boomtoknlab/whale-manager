import { Router } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../index.js'
import { users, subscriptions } from '../db/schema.js'
import { z } from 'zod'

const router = Router()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body)
    
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name
      })
      .returning()
    
    // Create free subscription
    await db.insert(subscriptions).values({
      userId: newUser[0].id,
      tier: 'free',
      status: 'active'
    })
    
    // Log in user
    req.login(newUser[0], (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Login failed after signup'
        })
      }
      
      res.json({
        success: true,
        data: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name
        }
      })
    })
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid signup data'
    })
  }
})

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      })
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Login failed'
        })
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })
    })
  })(req, res, next)
})

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      })
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  })
})

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    })
  }
  
  res.json({
    success: true,
    data: req.user
  })
})

export { router as authRoutes }
