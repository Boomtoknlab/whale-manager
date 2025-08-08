import { Router } from 'express'
import { eq, and } from 'drizzle-orm'
import { db } from '../index.js'
import { alerts, alertTriggers } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

const alertConditionSchema = z.object({
  type: z.enum(['balance', 'transaction', 'price', 'volume']),
  operator: z.enum(['>', '<', '=', '>=', '<=']),
  value: z.number(),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '24h']).optional()
})

const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  conditions: z.array(alertConditionSchema).min(1),
  actions: z.array(z.enum(['discord', 'slack', 'telegram', 'email', 'sms'])).min(1)
})

// Get user alerts
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    
    const userAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(alerts.createdAt)
    
    res.json({
      success: true,
      data: userAlerts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    })
  }
})

// Create alert
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    const alertData = createAlertSchema.parse(req.body)
    
    const newAlert = await db
      .insert(alerts)
      .values({
        userId,
        ...alertData
      })
      .returning()
    
    res.json({
      success: true,
      data: newAlert[0]
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid alert data'
    })
  }
})

// Update alert
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    const alertId = req.params.id
    const updates = createAlertSchema.partial().parse(req.body)
    
    const updatedAlert = await db
      .update(alerts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
      .returning()
    
    if (updatedAlert.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      })
    }
    
    res.json({
      success: true,
      data: updatedAlert[0]
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid update data'
    })
  }
})

// Delete alert
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    const alertId = req.params.id
    
    const deletedAlert = await db
      .delete(alerts)
      .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
      .returning()
    
    if (deletedAlert.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert'
    })
  }
})

// Toggle alert active status
router.patch('/:id/toggle', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    const alertId = req.params.id
    
    // Get current alert
    const currentAlert = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
      .limit(1)
    
    if (currentAlert.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      })
    }
    
    // Toggle active status
    const updatedAlert = await db
      .update(alerts)
      .set({
        isActive: !currentAlert[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(alerts.id, alertId))
      .returning()
    
    res.json({
      success: true,
      data: updatedAlert[0]
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to toggle alert'
    })
  }
})

// Get alert triggers/history
router.get('/:id/triggers', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    const alertId = req.params.id
    const { limit = 20, offset = 0 } = req.query
    
    // Verify alert belongs to user
    const alert = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
      .limit(1)
    
    if (alert.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      })
    }
    
    // Get triggers
    const triggers = await db
      .select()
      .from(alertTriggers)
      .where(eq(alertTriggers.alertId, alertId))
      .orderBy(alertTriggers.triggeredAt)
      .limit(Number(limit))
      .offset(Number(offset))
    
    res.json({
      success: true,
      data: triggers,
      pagination: {
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert triggers'
    })
  }
})

export { router as alertRoutes }
