import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import session from 'express-session'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import ConnectPgSimple from 'connect-pg-simple'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from './config.js'
import { schema } from './db/schema.js'
import { authRoutes } from './routes/auth.js'
import { whaleRoutes } from './routes/whales.js'
import { subscriptionRoutes } from './routes/subscriptions.js'
import { alertRoutes } from './routes/alerts.js'
import { WebSocketManager } from './services/websocket.js'
import { WhaleTracker } from './services/whale-tracker.js'
import { AlertEngine } from './services/alert-engine.js'
import { errorHandler } from './middleware/error-handler.js'
import { rateLimiter } from './middleware/rate-limiter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize database
const sql = neon(config.DATABASE_URL)
export const db = drizzle(sql, { schema })

// Initialize Express app
const app = express()
const server = createServer(app)

// Initialize WebSocket server
const wss = new WebSocketServer({ server })
const wsManager = new WebSocketManager(wss)

// Initialize services
const whaleTracker = new WhaleTracker(db, wsManager)
const alertEngine = new AlertEngine(db, wsManager)

// Middleware
app.use(cors({
  origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : true,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Session configuration
const PgSession = ConnectPgSimple(session)
app.use(session({
  store: new PgSession({
    conString: config.DATABASE_URL,
    tableName: 'session'
  }),
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport configuration
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Implement user authentication logic
      // This would check against your users table
      return done(null, { id: '1', email })
    } catch (error) {
      return done(error)
    }
  }
))

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    // Fetch user from database
    done(null, { id, email: 'user@example.com' })
  } catch (error) {
    done(error)
  }
})

// Rate limiting
app.use('/api', rateLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/whales', whaleRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/alerts', alertRoutes)

// Serve static files in production
if (config.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'))
  })
}

// Error handling
app.use(errorHandler)

// Start services
async function startServices() {
  try {
    // Start whale tracking
    await whaleTracker.start()
    console.log('🐋 Whale tracker started')
    
    // Start alert engine
    await alertEngine.start()
    console.log('🚨 Alert engine started')
    
    console.log('✅ All services started successfully')
  } catch (error) {
    console.error('❌ Failed to start services:', error)
    process.exit(1)
  }
}

// Start server
const PORT = config.PORT || 3000
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Environment: ${config.NODE_ENV}`)
  
  await startServices()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})
