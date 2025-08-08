import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface Transaction {
  id: string
  signature: string
  whaleAddress: string
  type: 'buy' | 'sell'
  amount: string
  valueUsd: string
  blockTime: string
}

export default function WhaleTracker() {
  const { lastMessage, isConnected } = useWebSocket()
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([])

  const { data: recentTransactions, refetch } = useQuery({
    queryKey: ['whales', 'transactions', 'recent'],
    queryFn: async () => {
      const response = await api.get('/whales/transactions/recent?limit=10')
      return response.data.data
    },
    refetchInterval: 30000,
  })

  // Handle real-time transaction updates
  useEffect(() => {
    if (lastMessage?.type === 'new_transaction') {
      setLiveTransactions(prev => [lastMessage.data, ...prev.slice(0, 9)])
    } else if (lastMessage?.type === 'recent_transactions') {
      setLiveTransactions(lastMessage.data)
    }
  }, [lastMessage])

  const transactions = liveTransactions.length > 0 ? liveTransactions : (recentTransactions || [])

  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseFloat(num) : num
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
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
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx: Transaction) => (
            <div
              key={tx.id || tx.signature}
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
                      {formatWallet(tx.whaleAddress)}
                    </span>
                    <Badge 
                      variant={tx.type === 'buy' ? 'default' : 'destructive'}
                      className={tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatNumber(tx.amount)} $CHONK9K • ${formatNumber(tx.valueUsd)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(tx.blockTime).toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => window.open(`https://solscan.io/tx/${tx.signature}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {transactions.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No recent whale activity</p>
            <p className="text-sm text-gray-500 mt-2">
              Transactions will appear here in real-time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
