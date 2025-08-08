export interface AlertCondition {
  type: 'balance' | 'transaction' | 'price' | 'volume'
  operator: '>' | '<' | '=' | '>=' | '<='
  value: number
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '24h'
}

export interface Alert {
  id: string
  name: string
  conditions: AlertCondition[]
  actions: ('discord' | 'telegram' | 'email' | 'sms')[]
  isActive: boolean
  userId: string
  createdAt: Date
  triggeredCount: number
  lastTriggered?: Date
}

export interface AlertTrigger {
  alertId: string
  triggeredAt: Date
  conditions: AlertCondition[]
  data: any
  message: string
}

// Alert evaluation engine
export class AlertEngine {
  private alerts: Alert[] = []
  private triggers: AlertTrigger[] = []

  addAlert(alert: Alert) {
    this.alerts.push(alert)
  }

  removeAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId)
  }

  updateAlert(alertId: string, updates: Partial<Alert>) {
    const index = this.alerts.findIndex(a => a.id === alertId)
    if (index !== -1) {
      this.alerts[index] = { ...this.alerts[index], ...updates }
    }
  }

  // Evaluate all active alerts against new data
  evaluateAlerts(data: {
    whales: any[]
    transactions: any[]
    price: number
    volume24h: number
  }) {
    const activeAlerts = this.alerts.filter(a => a.isActive)
    
    for (const alert of activeAlerts) {
      if (this.shouldTriggerAlert(alert, data)) {
        this.triggerAlert(alert, data)
      }
    }
  }

  private shouldTriggerAlert(alert: Alert, data: any): boolean {
    // Check if all conditions are met
    return alert.conditions.every(condition => {
      switch (condition.type) {
        case 'balance':
          return data.whales.some((whale: any) => 
            this.compareValues(whale.balance, condition.operator, condition.value)
          )
        case 'transaction':
          return data.transactions.some((tx: any) => 
            this.compareValues(tx.amount, condition.operator, condition.value)
          )
        case 'price':
          return this.compareValues(data.price, condition.operator, condition.value)
        case 'volume':
          return this.compareValues(data.volume24h, condition.operator, condition.value)
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

  private async triggerAlert(alert: Alert, data: any) {
    const trigger: AlertTrigger = {
      alertId: alert.id,
      triggeredAt: new Date(),
      conditions: alert.conditions,
      data,
      message: this.generateAlertMessage(alert, data)
    }

    this.triggers.push(trigger)
    
    // Update alert stats
    alert.triggeredCount++
    alert.lastTriggered = new Date()

    // Send notifications
    for (const action of alert.actions) {
      await this.sendNotification(action, trigger.message, data)
    }
  }

  private generateAlertMessage(alert: Alert, data: any): string {
    // Generate human-readable alert message
    return `🚨 ${alert.name} triggered! Check your dashboard for details.`
  }

  private async sendNotification(type: string, message: string, data: any) {
    switch (type) {
      case 'discord':
        await this.sendDiscordWebhook(message, data)
        break
      case 'telegram':
        await this.sendTelegramMessage(message)
        break
      case 'email':
        await this.sendEmail(message)
        break
      case 'sms':
        await this.sendSMS(message)
        break
    }
  }

  private async sendDiscordWebhook(message: string, data: any) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🐋 CHONK9K Whale Alert',
            description: message,
            color: 0xFF6B35,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: 'Current Price',
                value: `$${data.price?.toFixed(6) || 'N/A'}`,
                inline: true
              },
              {
                name: '24h Volume',
                value: `$${data.volume24h?.toLocaleString() || 'N/A'}`,
                inline: true
              }
            ]
          }]
        })
      })
    } catch (error) {
      console.error('Discord webhook error:', error)
    }
  }

  private async sendTelegramMessage(message: string) {
    // Implement Telegram Bot API integration
    console.log('Telegram notification:', message)
  }

  private async sendEmail(message: string) {
    // Implement email service integration (SendGrid, etc.)
    console.log('Email notification:', message)
  }

  private async sendSMS(message: string) {
    // Implement SMS service integration (Twilio, etc.)
    console.log('SMS notification:', message)
  }

  getAlerts(): Alert[] {
    return this.alerts
  }

  getTriggers(): AlertTrigger[] {
    return this.triggers
  }
}

// Global alert engine instance
export const alertEngine = new AlertEngine()
