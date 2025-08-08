import { WebSocketServer, WebSocket } from 'ws'
import { z } from 'zod'

const messageSchema = z.object({
  type: z.string(),
  data: z.any(),
  timestamp: z.date().optional(),
})

export type WebSocketMessage = z.infer<typeof messageSchema>

export class WebSocketManager {
  private clients = new Set<WebSocket>()

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketServer()
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket connection')
      this.clients.add(ws)

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        data: { message: 'Connected to CHONK9K Whale Manager' },
        timestamp: new Date()
      })

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          console.error('Invalid WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.clients.delete(ws)
      })
    })
  }

  private handleMessage(ws: WebSocket, message: any) {
    try {
      const validMessage = messageSchema.parse(message)
      
      switch (validMessage.type) {
        case 'subscribe_whales':
          // Handle whale subscription
          this.send(ws, {
            type: 'subscribed',
            data: { channel: 'whales' }
          })
          break
          
        case 'subscribe_transactions':
          // Handle transaction subscription
          this.send(ws, {
            type: 'subscribed',
            data: { channel: 'transactions' }
          })
          break
          
        case 'ping':
          this.send(ws, {
            type: 'pong',
            data: { timestamp: new Date() }
          })
          break
          
        default:
          console.log('Unknown message type:', validMessage.type)
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error)
    }
  }

  send(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date()
      }))
    }
  }

  broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date()
    })

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr)
      }
    })
  }

  getClientCount(): number {
    return this.clients.size
  }
}
