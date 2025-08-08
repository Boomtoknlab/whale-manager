"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, ExternalLink } from 'lucide-react'
import { useState, useEffect } from "react"

interface WhaleTransaction {
  id: string
  wallet: string
  type: 'buy' | 'sell'
  amount: number
  value: number
  timestamp: Date
  txHash: string
}

export default function WhaleTracker() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [isLive, setIsLive] = useState(true)

  // Simulate real-time whale transactions
  useEffect(() => {
    const generateTransaction = (): WhaleTransaction => {
      const wallets = [
        '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m',
        '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p',
        '3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r',
        '5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t',
        '1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v'
      ]
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        wallet: wallets[Math.floor(Math.random() * wallets.length)],
        type: Math.random() > 0.6 ? 'buy' : 'sell',
        amount: Math.floor(Math.random() * 500000) + 100000,
        value: Math.floor(Math.random() * 50000) + 10000,
        timestamp: new Date(),
        txHash: Math.random().toString(36).substr(2, 16)
      }
    }

    // Add initial transactions
    const initialTransactions = Array.from({ length: 5 }, generateTransaction)
    setTransactions(initialTransactions)

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        const newTransaction = generateTransaction()
        setTransactions(prev => [newTransaction, ...prev.slice(0, 9)])
      }
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [isLive])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Live Whale Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLive(!isLive)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  tx.type === 'buy' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {tx.type === 'buy' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">
                      {formatWallet(tx.wallet)}
                    </span>
                    <Badge 
                      variant={tx.type === 'buy' ? 'default' : 'destructive'}
                      className={tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatNumber(tx.amount)} $CHONK9K • ${formatNumber(tx.value)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {tx.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium mb-1">🚨 Whale Alert!</h3>
              <p className="text-sm text-gray-300">
                Large accumulation detected. 3 whales bought 1.2M tokens in the last hour.
              </p>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
