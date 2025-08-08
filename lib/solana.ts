import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Solana configuration
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
export const CHONK9K_MINT = 'DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump'
export const WHALE_THRESHOLD = 100000 // 100K tokens minimum for whale status

// Initialize Solana connection
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

export interface WhaleWallet {
  address: string
  balance: number
  balanceUSD: number
  lastActivity: Date
  transactionCount24h: number
  change24h: number
}

export interface Transaction {
  signature: string
  wallet: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: Date
  blockTime: number
}

// Get token accounts for CHONK9K
export async function getTokenAccounts(mintAddress: string): Promise<WhaleWallet[]> {
  try {
    const mintPublicKey = new PublicKey(mintAddress)
    
    // Get all token accounts for the mint
    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // Token Program ID
      {
        filters: [
          {
            dataSize: 165, // Token account data size
          },
          {
            memcmp: {
              offset: 0,
              bytes: mintPublicKey.toBase58(),
            },
          },
        ],
      }
    )

    const whales: WhaleWallet[] = []

    for (const account of tokenAccounts) {
      const parsedInfo = account.account.data.parsed?.info
      if (parsedInfo && parsedInfo.tokenAmount.uiAmount >= WHALE_THRESHOLD) {
        whales.push({
          address: parsedInfo.owner,
          balance: parsedInfo.tokenAmount.uiAmount,
          balanceUSD: parsedInfo.tokenAmount.uiAmount * 0.1, // Mock price
          lastActivity: new Date(),
          transactionCount24h: Math.floor(Math.random() * 20),
          change24h: (Math.random() - 0.5) * 20
        })
      }
    }

    return whales.sort((a, b) => b.balance - a.balance)
  } catch (error) {
    console.error('Error fetching token accounts:', error)
    return []
  }
}

// Get recent transactions for a wallet
export async function getWalletTransactions(walletAddress: string): Promise<Transaction[]> {
  try {
    const publicKey = new PublicKey(walletAddress)
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 })
    
    const transactions: Transaction[] = []
    
    for (const sig of signatures.slice(0, 10)) {
      const tx = await connection.getParsedTransaction(sig.signature)
      if (tx && tx.blockTime) {
        // Parse transaction for CHONK9K transfers
        // This is simplified - in production you'd parse the actual instruction data
        transactions.push({
          signature: sig.signature,
          wallet: walletAddress,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          amount: Math.floor(Math.random() * 500000) + 10000,
          price: Math.random() * 0.1 + 0.05,
          timestamp: new Date(tx.blockTime * 1000),
          blockTime: tx.blockTime
        })
      }
    }
    
    return transactions
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return []
  }
}

// Monitor for new transactions
export function subscribeToTransactions(callback: (transaction: Transaction) => void) {
  // In production, this would use WebSocket connection to monitor logs
  const interval = setInterval(() => {
    const mockTransaction: Transaction = {
      signature: Math.random().toString(36).substr(2, 16),
      wallet: '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m',
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: Math.floor(Math.random() * 500000) + 100000,
      price: Math.random() * 0.1 + 0.05,
      timestamp: new Date(),
      blockTime: Math.floor(Date.now() / 1000)
    }
    
    callback(mockTransaction)
  }, 5000)
  
  return () => clearInterval(interval)
}

// Price tracking
export async function getTokenPrice(mintAddress: string): Promise<number> {
  try {
    // In production, integrate with Jupiter API or other price feeds
    // For now, return mock price with some volatility
    const basePrice = 0.08
    const volatility = (Math.random() - 0.5) * 0.02
    return basePrice + volatility
  } catch (error) {
    console.error('Error fetching token price:', error)
    return 0.08
  }
}
