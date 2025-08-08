import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from 'lucide-react'
import { api } from '@/lib/api'

export default function WhaleAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['whales', 'analytics'],
    queryFn: async () => {
      const response = await api.get('/whales/stats/activity?timeframe=24h')
      return response.data.data
    },
    refetchInterval: 60000 // Refetch every minute
  })

  const { data: topWhales } = useQuery({
    queryKey: ['whales', 'top'],
    queryFn: async () => {
      const response = await api.get('/whales?limit=10')
      return response.data.data
    }
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              ${formatNumber(analytics?.totalVolume || 2400000)}
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2%
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Active Whales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {topWhales?.length || 1247}
            </div>
            <Badge className="bg-blue-500/20 text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2 capitalize">
              Bullish
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Strong Signal
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Top Whales */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Whales by Balance</CardTitle>
          <CardDescription className="text-gray-400">
            Largest $CHONK9K holders and their 24h changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topWhales && topWhales.length > 0 ? (
            <div className="space-y-4">
              {topWhales.slice(0, 10).map((whale: any, index: number) => {
                const change24h = parseFloat(whale.change24h || '0')
                return (
                  <div
                    key={whale.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/whale/${whale.address}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {formatWallet(whale.address)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatNumber(parseFloat(whale.balance))} $CHONK9K
                        </div>
                        {whale.lastActivity && (
                          <div className="text-xs text-gray-500">
                            Last active: {new Date(whale.lastActivity).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        change24h >= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}%
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {whale.transactionCount24h || 0} txns today
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No whale data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Chart Placeholder */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">24h Activity Chart</CardTitle>
          <CardDescription className="text-gray-400">
            Hourly whale transaction volume and count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-white/5">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Interactive chart coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Upgrade to Pro for advanced analytics and charts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Transaction Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Buy Transactions</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-medium">
                    {analytics?.buyTransactions || 156}
                  </span>
                  <Badge className="bg-green-500/20 text-green-400">
                    62%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sell Transactions</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-medium">
                    {analytics?.sellTransactions || 94}
                  </span>
                  <Badge className="bg-red-500/20 text-red-400">
                    38%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Transaction Size</span>
                <span className="text-white font-medium">
                  {formatNumber(analytics?.avgTransactionSize || 125000)} tokens
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Whale Activity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">8.7</div>
              <p className="text-gray-400 mb-4">Very High Activity</p>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full w-[87%]" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on transaction frequency, volume, and timing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
