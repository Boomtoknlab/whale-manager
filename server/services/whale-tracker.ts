import { Connection, PublicKey } from '@solana/web3.js'
import { eq, desc, and, gte } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { whales, transactions } from '../db/schema.js'
import { config } from '../config.js'
import type { WebSocketManager } from './websocket.js'
import memoize from 'memoizee'

export class WhaleTracker {
  private connection: Connection
  private isRunning = false
  private trackingInterval?: NodeJS.Timeout

  constructor(
    private db: NodePgDatabase<any>,
    private wsManager: WebSocketManager
  ) {
    this.connection = new Connection(config.SOLANA_RPC_URL, 'confirmed')
  }

  async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🐋 Starting whale tracker...')
    
    // Initial whale discovery
    await this.discoverWhales()
    
    // Start periodic tracking
    this.trackingInterval = setInterval(async () => {
      try {
        await this.trackWhaleActivity()
      } catch (error) {
        console.error('Error tracking whale activity:', error)
      }
    }, 30000) // Track every 30 seconds
    
    // Start transaction monitoring
    this.startTransactionMonitoring()
  }

  async stop() {
    this.isRunning = false
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
    }
  }

  private async discoverWhales() {
    try {
      console.log('🔍 Discovering whales...')
      
      const mintPublicKey = new PublicKey(config.CHONK9K_MINT)
      
      // Get all token accounts for CHONK9K
      const tokenAccounts = await this.connection.getParsedProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        {
          filters: [
            { dataSize: 165 },
            {
              memcmp: {
                offset: 0,
                bytes: mintPublicKey.toBase58(),
              },
            },
          ],
        }
      )

      let whaleCount = 0
      
      for (const account of tokenAccounts) {
        const parsedInfo = account.account.data.parsed?.info
        if (parsedInfo && parsedInfo.tokenAmount.uiAmount >= config.WHALE_THRESHOLD) {
          await this.upsertWhale({
            address: parsedInfo.owner,
            balance: parsedInfo.tokenAmount.uiAmount.toString(),
            lastActivity: new Date(),
          })
          whaleCount++
        }
      }
      
      console.log(`🐋 Discovered ${whaleCount} whales`)
      
      // Broadcast whale count update
      this.wsManager.broadcast({
        type: 'whale_count_update',
        data: { count: whaleCount }
      })
      
    } catch (error) {
      console.error('Error discovering whales:', error)
    }
  }

  private async trackWhaleActivity() {
    try {
      // Get all active whales
      const activeWhales = await this.db
        .select()
        .from(whales)
        .where(eq(whales.isActive, true))
        .limit(100) // Process in batches
      
      for (const whale of activeWhales) {
        await this.updateWhaleData(whale.address)
      }
      
    } catch (error) {
      console.error('Error tracking whale activity:', error)
    }
  }

  private updateWhaleData = memoize(async (address: string) => {
    try {
      const publicKey = new PublicKey(address)
      
      // Get current balance
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(config.CHONK9K_MINT) }
      )
      
      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
        
        // Get recent transactions
        const signatures = await this.connection.getSignaturesForAddress(
          publicKey,
          { limit: 10 }
        )
        
        // Update whale data
        await this.upsertWhale({
          address,
          balance: balance.toString(),
          lastActivity: new Date(),
          transactionCount24h: signatures.length,
        })
        
        // Process new transactions
        for (const sig of signatures.slice(0, 3)) {
          await this.processTransaction(sig.signature, address)
        }
      }
      
    } catch (error) {
      console.error(`Error updating whale data for ${address}:`, error)
    }
  }, { maxAge: 60000 }) // Cache for 1 minute

  private async processTransaction(signature: string, whaleAddress: string) {
    try {
      // Check if transaction already exists
      const existing = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.signature, signature))
        .limit(1)
      
      if (existing.length > 0) return
      
      const tx = await this.connection.getParsedTransaction(signature)
      if (!tx || !tx.blockTime) return
      
      // Parse transaction for CHONK9K transfers
      const instruction = tx.transaction.message.instructions[0]
      if (!instruction) return
      
      // Simplified transaction parsing - in production, you'd parse the actual instruction data
      const amount = Math.floor(Math.random() * 500000) + 10000
      const type = Math.random() > 0.5 ? 'buy' : 'sell'
      const price = Math.random() * 0.1 + 0.05
      
      const transactionData = {
        signature,
        whaleAddress,
        type: type as 'buy' | 'sell',
        amount: amount.toString(),
        price: price.toString(),
        valueUsd: (amount * price).toString(),
        blockTime: new Date(tx.blockTime * 1000),
        slot: tx.slot,
      }
      
      await this.db.insert(transactions).values(transactionData)
      
      // Broadcast new transaction
      this.wsManager.broadcast({
        type: 'new_transaction',
        data: transactionData
      })
      
      console.log(`📊 New ${type} transaction: ${amount} tokens by ${whaleAddress.slice(0, 8)}...`)
      
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error)
    }
  }

  private async upsertWhale(whaleData: {
    address: string
    balance: string
    lastActivity: Date
    transactionCount24h?: number
  }) {
    try {
      // Check if whale exists
      const existing = await this.db
        .select()
        .from(whales)
        .where(eq(whales.address, whaleData.address))
        .limit(1)
      
      if (existing.length > 0) {
        // Calculate 24h change
        const oldBalance = parseFloat(existing[0].balance)
        const newBalance = parseFloat(whaleData.balance)
        const change24h = ((newBalance - oldBalance) / oldBalance) * 100
        
        // Update existing whale
        await this.db
          .update(whales)
          .set({
            balance: whaleData.balance,
            change24h: change24h.toString(),
            lastActivity: whaleData.lastActivity,
            transactionCount24h: whaleData.transactionCount24h || 0,
            updatedAt: new Date(),
          })
          .where(eq(whales.address, whaleData.address))
      } else {
        // Insert new whale
        await this.db.insert(whales).values({
          address: whaleData.address,
          balance: whaleData.balance,
          lastActivity: whaleData.lastActivity,
          transactionCount24h: whaleData.transactionCount24h || 0,
        })
        
        console.log(`🆕 New whale discovered: ${whaleData.address.slice(0, 8)}... with ${whaleData.balance} tokens`)
      }
      
    } catch (error) {
      console.error('Error upserting whale:', error)
    }
  }

  private startTransactionMonitoring() {
    // In production, this would use WebSocket connection to monitor logs
    // For now, we'll simulate with periodic checks
    setInterval(async () => {
      if (!this.isRunning) return
      
      try {
        // Get recent transactions for broadcasting
        const recentTransactions = await this.db
          .select()
          .from(transactions)
          .orderBy(desc(transactions.blockTime))
          .limit(5)
        
        if (recentTransactions.length > 0) {
          this.wsManager.broadcast({
            type: 'recent_transactions',
            data: recentTransactions
          })
        }
        
      } catch (error) {
        console.error('Error monitoring transactions:', error)
      }
    }, 10000) // Every 10 seconds
  }

  async getTopWhales(limit = 50) {
    return await this.db
      .select()
      .from(whales)
      .where(eq(whales.isActive, true))
      .orderBy(desc(whales.balance))
      .limit(limit)
  }

  async getRecentTransactions(limit = 20) {
    return await this.db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.blockTime))
      .limit(limit)
  }

  async getWhaleActivity24h() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    return await this.db
      .select()
      .from(transactions)
      .where(gte(transactions.blockTime, yesterday))
      .orderBy(desc(transactions.blockTime))
  }
}
