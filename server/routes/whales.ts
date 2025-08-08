import { Router } from 'express'
import { eq, desc, gte, and } from 'drizzle-orm'
import { db } from '../index.js'
import { whales, transactions } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

// Get top whales
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    
    const topWhales = await db
      .select()
      .from(whales)
      .where(eq(whales.isActive, true))
      .orderBy(desc(whales.balance))
      .limit(Number(limit))
      .offset(Number(offset))
    
    res.json({
      success: true,
      data: topWhales,
      pagination: {
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch whales'
    })
  }
})

// Get whale details
router.get('/:address', requireAuth, async (req, res) => {
  try {
    const { address } = req.params
    
    const whale = await db
      .select()
      .from(whales)
      .where(eq(whales.address, address))
      .limit(1)
    
    if (whale.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Whale not found'
      })
    }
    
    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.whaleAddress, address))
      .orderBy(desc(transactions.blockTime))
      .limit(20)
    
    res.json({
      success: true,
      data: {
        whale: whale[0],
        transactions: recentTransactions
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch whale details'
    })
  }
})

// Get whale transactions
router.get('/:address/transactions', requireAuth, async (req, res) => {
  try {
    const { address } = req.params
    const { limit = 20, offset = 0, type } = req.query
    
    let query = db
      .select()
      .from(transactions)
      .where(eq(transactions.whaleAddress, address))
    
    if (type && ['buy', 'sell', 'transfer'].includes(type as string)) {
      query = query.where(and(
        eq(transactions.whaleAddress, address),
        eq(transactions.type, type as any)
      ))
    }
    
    const whaleTransactions = await query
      .orderBy(desc(transactions.blockTime))
      .limit(Number(limit))
      .offset(Number(offset))
    
    res.json({
      success: true,
      data: whaleTransactions,
      pagination: {
        limit: Number(limit),
        offset: Number(offset)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch whale transactions'
    })
  }
})

// Get recent transactions across all whales
router.get('/transactions/recent', requireAuth, async (req, res) => {
  try {
    const { limit = 20, type } = req.query
    
    let query = db.select().from(transactions)
    
    if (type && ['buy', 'sell', 'transfer'].includes(type as string)) {
      query = query.where(eq(transactions.type, type as any))
    }
    
    const recentTransactions = await query
      .orderBy(desc(transactions.blockTime))
      .limit(Number(limit))
    
    res.json({
      success: true,
      data: recentTransactions
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent transactions'
    })
  }
})

// Get whale activity stats
router.get('/stats/activity', requireAuth, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query
    
    let timeAgo: Date
    switch (timeframe) {
      case '1h':
        timeAgo = new Date(Date.now() - 60 * 60 * 1000)
        break
      case '24h':
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        timeAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
    
    const recentActivity = await db
      .select()
      .from(transactions)
      .where(gte(transactions.blockTime, timeAgo))
    
    const stats = {
      totalTransactions: recentActivity.length,
      totalVolume: recentActivity.reduce((sum, tx) => sum + parseFloat(tx.valueUsd || '0'), 0),
      buyTransactions: recentActivity.filter(tx => tx.type === 'buy').length,
      sellTransactions: recentActivity.filter(tx => tx.type === 'sell').length,
      avgTransactionSize: recentActivity.length > 0 
        ? recentActivity.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / recentActivity.length 
        : 0
    }
    
    res.json({
      success: true,
      data: stats,
      timeframe
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity stats'
    })
  }
})

export { router as whaleRoutes }
