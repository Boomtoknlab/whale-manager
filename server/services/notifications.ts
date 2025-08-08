import { WebApi } from '@slack/web-api'
import { config } from '../config.js'

export class NotificationService {
  private slackClient?: WebApi

  constructor() {
    if (config.SLACK_BOT_TOKEN) {
      this.slackClient = new WebApi(config.SLACK_BOT_TOKEN)
    }
  }

  async send(type: string, message: string, data?: any) {
    switch (type) {
      case 'discord':
        await this.sendDiscord(message, data)
        break
      case 'slack':
        await this.sendSlack(message, data)
        break
      case 'telegram':
        await this.sendTelegram(message)
        break
      case 'email':
        await this.sendEmail(message)
        break
      case 'sms':
        await this.sendSMS(message)
        break
      default:
        console.log(`Unknown notification type: ${type}`)
    }
  }

  private async sendDiscord(message: string, data?: any) {
    if (!config.DISCORD_WEBHOOK_URL) return

    try {
      const embed = {
        title: '🐋 CHONK9K Whale Alert',
        description: message,
        color: 0xFF6B35,
        timestamp: new Date().toISOString(),
        fields: []
      }

      if (data) {
        if (data.price) {
          embed.fields.push({
            name: 'Current Price',
            value: `$${data.price.toFixed(6)}`,
            inline: true
          })
        }
        
        if (data.volume24h) {
          embed.fields.push({
            name: '24h Volume',
            value: `$${data.volume24h.toLocaleString()}`,
            inline: true
          })
        }
      }

      await fetch(config.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      })

      console.log('✅ Discord notification sent')
    } catch (error) {
      console.error('Discord notification error:', error)
    }
  }

  private async sendSlack(message: string, data?: any) {
    if (!this.slackClient) return

    try {
      await this.slackClient.chat.postMessage({
        channel: '#whale-alerts',
        text: message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
        ]
      })

      console.log('✅ Slack notification sent')
    } catch (error) {
      console.error('Slack notification error:', error)
    }
  }

  private async sendTelegram(message: string) {
    if (!config.TELEGRAM_BOT_TOKEN) return

    try {
      // Implement Telegram Bot API
      console.log('📱 Telegram notification:', message)
    } catch (error) {
      console.error('Telegram notification error:', error)
    }
  }

  private async sendEmail(message: string) {
    try {
      // Implement email service (SendGrid, etc.)
      console.log('📧 Email notification:', message)
    } catch (error) {
      console.error('Email notification error:', error)
    }
  }

  private async sendSMS(message: string) {
    try {
      // Implement SMS service (Twilio, etc.)
      console.log('📱 SMS notification:', message)
    } catch (error) {
      console.error('SMS notification error:', error)
    }
  }
}
