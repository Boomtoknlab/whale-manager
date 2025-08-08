import { eq, and, gte } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { alerts, alertTriggers, whales, transactions } from '../db/schema.js'
import type { WebSocketManager } from './websocket.js'
import { NotificationService } from './notifications.js'

interface AlertCondition {
  type: 'balance' | 'transaction' | 'price' | 'volume'
  operator: '>' | '<' | '=' | '>=' | '<='
  value: number
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '24h'
}

export class AlertEngine {
  private isRunning = false
  private checkInterval?: NodeJS.Timeout
  private notificationService: NotificationService

  constructor(
    private db: NodePgDatabase<any>,
    private wsManager: WebSocketManager
  ) {
    this.notificationService = new NotificationService()
  }

  async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🚨 Starting alert engine...')
    
    // Check alerts every 30 seconds
    this.checkInterval = setInterval(async () => {
      try {
        await this.evaluateAlerts()
      } catch (error) {
        console.error('Error evaluating alerts:', error)
      }
    }, 30000)
  }

  async stop() {
    this.isRunning = false
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
  }

  private async evaluateAlerts() {
    try {
      // Get all active alerts
      const activeAlerts = await this.db
        .select()
        .from(alerts)
        .where(eq(alerts.isActive, true))
      
      for (const alert of activeAlerts) {
        await this.evaluateAlert(alert)
      }
      
    } catch (error) {
      console.error('Error evaluating alerts:', error)
    }
  }

  private async evaluateAlert(alert: any) {
    try {
      const conditions = alert.conditions as AlertCondition[]
      const actions = alert.actions as string[]
      
      // Get current market data
      const marketData = await this.getMarketData()
      
      // Check if all conditions are met
      const shouldTrigger = await this.checkConditions(conditions, marketData)
      
      if (shouldTrigger) {
        await this.triggerAlert(alert, marketData, actions)
      }
      
    } catch (error) {
      console.error(`Error evaluating alert ${alert.id}:`, error)
    }
  }

  private async getMarketData() {
    // Get recent whale data
    const topWhales = await this.db
      .select()
      .from(whales)
      .where(eq(whales.isActive, true))
      .limit(100)
    
    // Get recent transactions
    const recentTransactions = await this.db
      .select()
      .from(transactions)
      .where(gte(transactions.blockTime, new Date(Date.now() - 24 * 60 * 60 * 1000)))
    
    // Calculate metrics
    const totalVolume24h = recentTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.valueUsd || '0'), 0
    )
    
    const avgTransactionSize = recentTransactions.length > 0 
      ? totalVolume24h / recentTransactions.length 
      : 0
    
    return {
      whales: topWhales,
      transactions: recentTransactions,
      price: 0.08, // Mock price - integrate with price API
      volume24h: totalVolume24h,
      avgTransactionSize,
      whaleCount: topWhales.length
    }
  }

  private async checkConditions(conditions: AlertCondition[], marketData: any): Promise<boolean> {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'balance':
          return marketData.whales.some((whale: any) => 
            this.compareValues(parseFloat(whale.balance), condition.operator, condition.value)
          )
        case 'transaction':
          return marketData.transactions.some((tx: any) => 
            this.compareValues(parseFloat(tx.amount), condition.operator, condition.value)
          )
        case 'price':
          return this.compareValues(marketData.price, condition.operator, condition.value)
        case 'volume':
          return this.compareValues(marketData.volume24h, condition.operator, condition.value)
        default:
          return false
      }
    })
  }

  private compareValues(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case '>': return actual > expected
      case '<': return actual < expected
      case '=': return actual === expected
      case '>=': return actual >= expected
      case '<=': return actual <= expected
      default: return false
    }
  }

  private async triggerAlert(alert: any, marketData: any, actions: string[]) {
    try {
      const message = this.generateAlertMessage(alert, marketData)
      
      // Create alert trigger record
      await this.db.insert(alertTriggers).values({
        alertId: alert.id,
        conditions: alert.conditions,
        data: marketData,
        message,
        success: true,
      })
      
      // Update alert stats
      await this.db
        .update(alerts)
        .set({
          triggeredCount: alert.triggeredCount + 1,
          lastTriggered: new Date(),
        })
        .where(eq(alerts.id, alert.id))
      
      // Send notifications
      for (const action of actions) {
        await this.notificationService.send(action, message, marketData)
      }
      
      // Broadcast to WebSocket clients
      this.wsManager.broadcast({
        type: 'alert_triggered',
        data: {
          alertId: alert.id,
          alertName: alert.name,
          message,
          timestamp: new Date()
        }
      })
      
      console.log(`🚨 Alert triggered: ${alert.name}`)
      
    } catch (error) {
      console.error(`Error triggering alert ${alert.id}:`, error)
      
      // Record failed trigger
      await this.db.insert(alertTriggers).values({
        alertId: alert.id,
        conditions: alert.conditions,
        data: marketData,
        message: `Failed to trigger alert: ${error}`,
        success: false,
      })
    }
  }

  private generateAlertMessage(alert: any, marketData: any): string {
    const conditions = alert.conditions as AlertCondition[]
    
    // Generate contextual message based on conditions
    if (conditions.some(c => c.type === 'transaction')) {
      const largeTransactions = marketData.transactions.filter((tx: any) => 
        parseFloat(tx.amount) > 100000
      )
      
      if (largeTransactions.length > 0) {
        const tx = largeTransactions[0]
        return `🐋 Large ${tx.type} detected! ${parseFloat(tx.amount).toLocaleString()} $CHONK9K tokens (${tx.whaleAddress.slice(0, 8)}...)`
      }
    }
    
    if (conditions.some(c => c.type === 'volume')) {
      return `📈 Volume spike detected! 24h volume: $${marketData.volume24h.toLocaleString()}`
    }
    
    if (conditions.some(c => c.type === 'balance')) {
      return `🆕 New whale detected with ${conditions[0].value.toLocaleString()}+ tokens!`
    }
    
    return `🚨 ${alert.name} alert triggered!`
  }
}
