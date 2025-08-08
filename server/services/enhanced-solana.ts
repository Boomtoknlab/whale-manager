import { Connection, PublicKey, ParsedAccountData, GetProgramAccountsFilter } from '@solana/web3.js'
import { eq, desc, and, gte, sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { whales, transactions } from '../db/schema.js'
import { config } from '../config.js'
import type { WebSocketManager } from './websocket.js'
import memoize from 'memoizee'

interface TokenAccount {
  pubkey: PublicKey
  account: {
    data: ParsedAccountData
    executable: boolean
    lamports: number
    owner: PublicKey
    rentEpoch: number
  }
}

interface WhaleMetrics {
  totalBalance: number
  totalWhales: number
  avgBalance: number
  topWhaleBalance: number
  distributionScore: number
}

export class EnhancedSolanaService {
  private connection: Connection
  private isRunning = false
  private discoveryInterval?: NodeJS.Timeout
  private metricsInterval?: NodeJS.Timeout
  private priceCache = new Map<string, { price: number; timestamp: number }>()

  constructor(
    private db: NodePgDatabase<any>,
    private wsManager: WebSocketManager
  ) {
    this.connection = new Connection(config.SOLANA_RPC_URL, {
      commitment: 'confirmed',
      wsEndpoint: config.SOLANA_RPC_URL.replace('https', 'wss')
    })
  }

  async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🚀 Starting enhanced Solana service...')
    
    try {
      // Test connection
      const version = await this.connection.getVersion()
      console.log(`✅ Connected to Solana RPC: ${version['solana-core']}`)
      
      // Initial whale discovery
      await this.performWhaleDiscovery()
      
      // Start periodic discovery (every 5 minutes)
      this.discoveryInterval = setInterval(async () => {
        try {
          await this.performWhaleDiscovery()
        } catch (error) {
          console.error('Error in whale discovery:', error)
        }
      }, 5 * 60 * 1000)
      
      // Start metrics calculation (every minute)
      this.metricsInterval = setInterval(async () => {
        try {
          await this.calculateAndBroadcastMetrics()
        } catch (error) {
          console.error('Error calculating metrics:', error)
        }
      }, 60 * 1000)
      
      // Start transaction monitoring
      this.startTransactionMonitoring()
      
      console.log('✅ Enhanced Solana service started successfully')
      
    } catch (error) {
      console.error('❌ Failed to start enhanced Solana service:', error)
      throw error
    }
  }

  async stop() {
    this.isRunning = false
    
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval)
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }
    
    console.log('🛑 Enhanced Solana service stopped')
  }

  private async performWhaleDiscovery() {
    try {
      console.log('🔍 Performing whale discovery...')
      
      const mintPublicKey = new PublicKey(config.CHONK9K_MINT)
      
      // Get all token accounts for the mint
      const filters: GetProgramAccountsFilter[] = [
        { dataSize: 165 }, // Token account data size
        {
          memcmp: {
            offset: 0,
            bytes: mintPublicKey.toBase58(),
          },
        },
      ]
      
      const tokenAccounts = await this.connection.getParsedProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        { filters }
      ) as TokenAccount[]

      let discoveredWhales = 0
      let updatedWhales = 0
      
      // Process accounts in batches to avoid rate limits
      const batchSize = 10
      for (let i = 0; i < tokenAccounts.length; i += batchSize) {
        const batch = tokenAccounts.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (account) => {
          try {
            const parsedInfo = account.account.data.parsed?.info
            if (!parsedInfo) return
            
            const balance = parsedInfo.tokenAmount.uiAmount
            const owner = parsedInfo.owner
            
            if (balance >= config.WHALE_THRESHOLD) {
              const result = await this.upsertWhale({
                address: owner,
                balance: balance.toString(),
                lastActivity: new Date(),
              })
              
              if (result === 'created') {
                discoveredWhales++
              } else {
                updatedWhales++
              }
            }
          } catch (error) {
            console.error(`Error processing account ${account.pubkey.toBase58()}:`, error)
          }
        }))
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`🐋 Discovery complete: ${discoveredWhales} new whales, ${updatedWhales} updated`)
      
      // Broadcast discovery results
      this.wsManager.broadcast({
        type: 'whale_discovery_complete',
        data: {
          newWhales: discoveredWhales,
          updatedWhales: updatedWhales,
          totalProcessed: tokenAccounts.length
        }
      })
      
    } catch (error) {
      console.error('Error in whale discovery:', error)
      throw error
    }
  }

  private async upsertWhale(whaleData: {
    address: string
    balance: string
    lastActivity: Date
  }): Promise<'created' | 'updated'> {
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
        const change24h = oldBalance > 0 ? ((newBalance - oldBalance) / oldBalance) * 100 : 0
        
        // Update existing whale
        await this.db
          .update(whales)
          .set({
            balance: whaleData.balance,
            change24h: change24h.toString(),
            lastActivity: whaleData.lastActivity,
            updatedAt: new Date(),
          })
          .where(eq(whales.address, whaleData.address))
        
        return 'updated'
      } else {
        // Insert new whale
        await this.db.insert(whales).values({
          address: whaleData.address,
          balance: whaleData.balance,
          lastActivity: whaleData.lastActivity,
          firstSeen: new Date(),
        })
        
        console.log(`🆕 New whale discovered: ${whaleData.address.slice(0, 8)}... with ${whaleData.balance} tokens`)
        
        // Broadcast new whale discovery
        this.wsManager.broadcast({
          type: 'new_whale_discovered',
          data: {
            address: whaleData.address,
            balance: whaleData.balance,
            timestamp: new Date()
          }
        })
        
        return 'created'
      }
      
    } catch (error) {
      console.error('Error upserting whale:', error)
      throw error
    }
  }

  private startTransactionMonitoring() {
    console.log('📡 Starting transaction monitoring...')
    
    // Monitor for new transactions every 15 seconds
    setInterval(async () => {
      if (!this.isRunning) return
      
      try {
        await this.monitorRecentTransactions()
      } catch (error) {
        console.error('Error monitoring transactions:', error)
      }
    }, 15000)
  }

  private async monitorRecentTransactions() {
    try {
      // Get top 20 whales for monitoring
      const topWhales = await this.db
        .select()
        .from(whales)
        .where(eq(whales.isActive, true))
        .orderBy(desc(whales.balance))
        .limit(20)
      
      // Monitor transactions for each whale
      for (const whale of topWhales) {
        await this.checkWhaleTransactions(whale.address)
      }
      
    } catch (error) {
      console.error('Error monitoring recent transactions:', error)
    }
  }

  private checkWhaleTransactions = memoize(async (address: string) => {
    try {
      const publicKey = new PublicKey(address)
      
      // Get recent signatures
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit: 5 }
      )
      
      for (const sig of signatures) {
        // Check if we already processed this transaction
        const existing = await this.db
          .select()
          .from(transactions)
          .where(eq(transactions.signature, sig.signature))
          .limit(1)
        
        if (existing.length === 0) {
          await this.processTransaction(sig.signature, address)
        }
      }
      
    } catch (error) {
      console.error(`Error checking transactions for ${address}:`, error)
    }
  }, { maxAge: 30000 }) // Cache for 30 seconds

  private async processTransaction(signature: string, whaleAddress: string) {
    try {
      const tx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0
      })
      
      if (!tx || !tx.blockTime) return
      
      // Parse transaction for token transfers
      const tokenTransfers = this.parseTokenTransfers(tx, config.CHONK9K_MINT)
      
      for (const transfer of tokenTransfers) {
        if (transfer.amount > 10000) { // Only track significant transfers
          const price = await this.getTokenPrice()
          
          const transactionData = {
            signature,
            whaleAddress,
            type: transfer.type,
            amount: transfer.amount.toString(),
            price: price.toString(),
            valueUsd: (transfer.amount * price).toString(),
            blockTime: new Date(tx.blockTime * 1000),
            slot: tx.slot,
            metadata: {
              fee: tx.meta?.fee,
              success: tx.meta?.err === null,
              computeUnitsConsumed: tx.meta?.computeUnitsConsumed
            }
          }
          
          await this.db.insert(transactions).values(transactionData)
          
          // Broadcast new transaction
          this.wsManager.broadcast({
            type: 'new_transaction',
            data: transactionData
          })
          
          console.log(`📊 New ${transfer.type}: ${transfer.amount.toLocaleString()} tokens by ${whaleAddress.slice(0, 8)}...`)
        }
      }
      
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error)
    }
  }

  private parseTokenTransfers(tx: any, mintAddress: string): Array<{
    type: 'buy' | 'sell' | 'transfer'
    amount: number
    from?: string
    to?: string
  }> {
    const transfers: Array<{
      type: 'buy' | 'sell' | 'transfer'
      amount: number
      from?: string
      to?: string
    }> = []
    
    try {
      // Parse pre and post token balances
      const preBalances = tx.meta?.preTokenBalances || []
      const postBalances = tx.meta?.postTokenBalances || []
      
      // Find balance changes for our mint
      const relevantPre = preBalances.filter((b: any) => b.mint === mintAddress)
      const relevantPost = postBalances.filter((b: any) => b.mint === mintAddress)
      
      // Calculate balance changes
      for (const postBalance of relevantPost) {
        const preBalance = relevantPre.find((p: any) => p.accountIndex === postBalance.accountIndex)
        
        if (preBalance) {
          const preAmount = parseFloat(preBalance.uiTokenAmount.uiAmountString || '0')
          const postAmount = parseFloat(postBalance.uiTokenAmount.uiAmountString || '0')
          const change = postAmount - preAmount
          
          if (Math.abs(change) > 0) {
            transfers.push({
              type: change > 0 ? 'buy' : 'sell',
              amount: Math.abs(change),
              from: change < 0 ? postBalance.owner : undefined,
              to: change > 0 ? postBalance.owner : undefined
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Error parsing token transfers:', error)
    }
    
    return transfers
  }

  private async getTokenPrice(): Promise<number> {
    const cacheKey = config.CHONK9K_MINT
    const cached = this.priceCache.get(cacheKey)
    
    // Return cached price if less than 1 minute old
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.price
    }
    
    try {
      // In production, integrate with Jupiter API or other price feeds
      // For now, simulate price with some volatility
      const basePrice = 0.08
      const volatility = (Math.random() - 0.5) * 0.02
      const price = Math.max(0.001, basePrice + volatility)
      
      // Cache the price
      this.priceCache.set(cacheKey, {
        price,
        timestamp: Date.now()
      })
      
      return price
      
    } catch (error) {
      console.error('Error fetching token price:', error)
      return 0.08 // Fallback price
    }
  }

  private async calculateAndBroadcastMetrics() {
    try {
      const metrics = await this.calculateWhaleMetrics()
      
      // Broadcast metrics update
      this.wsManager.broadcast({
        type: 'whale_metrics_update',
        data: metrics
      })
      
    } catch (error) {
      console.error('Error calculating metrics:', error)
    }
  }

  private async calculateWhaleMetrics(): Promise<WhaleMetrics> {
    try {
      // Get whale statistics
      const whaleStats = await this.db
        .select({
          totalWhales: sql<number>`count(*)`,
          totalBalance: sql<number>`sum(cast(balance as numeric))`,
          avgBalance: sql<number>`avg(cast(balance as numeric))`,
          maxBalance: sql<number>`max(cast(balance as numeric))`
        })
        .from(whales)
        .where(eq(whales.isActive, true))
      
      const stats = whaleStats[0]
      
      // Calculate distribution score (0-100, higher = more distributed)
      const distributionScore = this.calculateDistributionScore(stats.totalBalance, stats.avgBalance, stats.maxBalance)
      
      return {
        totalBalance: stats.totalBalance || 0,
        totalWhales: stats.totalWhales || 0,
        avgBalance: stats.avgBalance || 0,
        topWhaleBalance: stats.maxBalance || 0,
        distributionScore
      }
      
    } catch (error) {
      console.error('Error calculating whale metrics:', error)
      return {
        totalBalance: 0,
        totalWhales: 0,
        avgBalance: 0,
        topWhaleBalance: 0,
        distributionScore: 0
      }
    }
  }

  private calculateDistributionScore(totalBalance: number, avgBalance: number, maxBalance: number): number {
    if (totalBalance === 0 || avgBalance === 0) return 0
    
    // Calculate how concentrated the top whale is
    const topWhalePercentage = (maxBalance / totalBalance) * 100
    
    // Score is inverse of concentration (100 - concentration percentage)
    // Cap at reasonable bounds
    const score = Math.max(0, Math.min(100, 100 - topWhalePercentage))
    
    return Math.round(score * 100) / 100 // Round to 2 decimal places
  }

  // Public methods for API endpoints
  async getWhaleMetrics(): Promise<WhaleMetrics> {
    return await this.calculateWhaleMetrics()
  }

  async getTopWhales(limit = 50) {
    return await this.db
      .select()
      .from(whales)
      .where(eq(whales.isActive, true))
      .orderBy(desc(whales.balance))
      .limit(limit)
  }

  async getWhaleByAddress(address: string) {
    const whale = await this.db
      .select()
      .from(whales)
      .where(eq(whales.address, address))
      .limit(1)
    
    return whale[0] || null
  }

  async getRecentTransactions(limit = 20) {
    return await this.db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.blockTime))
      .limit(limit)
  }

  async getWhaleTransactions(address: string, limit = 50) {
    return await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.whaleAddress, address))
      .orderBy(desc(transactions.blockTime))
      .limit(limit)
  }

  async getActivityStats(timeframe = '24h') {
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
    
    const activity = await this.db
      .select({
        totalTransactions: sql<number>`count(*)`,
        totalVolume: sql<number>`sum(cast(value_usd as numeric))`,
        buyTransactions: sql<number>`count(*) filter (where type = 'buy')`,
        sellTransactions: sql<number>`count(*) filter (where type = 'sell')`,
        avgTransactionSize: sql<number>`avg(cast(amount as numeric))`
      })
      .from(transactions)
      .where(gte(transactions.blockTime, timeAgo))
    
    return activity[0] || {
      totalTransactions: 0,
      totalVolume: 0,
      buyTransactions: 0,
      sellTransactions: 0,
      avgTransactionSize: 0
    }
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    rpcConnection: boolean
    lastDiscovery?: Date
    whaleCount: number
    recentTransactions: number
  }> {
    try {
      // Test RPC connection
      const slot = await this.connection.getSlot()
      const rpcConnection = slot > 0
      
      // Get whale count
      const whaleCount = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(whales)
        .where(eq(whales.isActive, true))
      
      // Get recent transaction count (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recentTxCount = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(gte(transactions.blockTime, oneHourAgo))
      
      const status = rpcConnection && whaleCount[0].count > 0 ? 'healthy' : 'degraded'
      
      return {
        status,
        rpcConnection,
        whaleCount: whaleCount[0].count,
        recentTransactions: recentTxCount[0].count
      }
      
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        status: 'unhealthy',
        rpcConnection: false,
        whaleCount: 0,
        recentTransactions: 0
      }
    }
  }
}
