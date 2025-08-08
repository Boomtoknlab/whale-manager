"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { useState, useEffect } from "react"

interface AnalyticsData {
  totalVolume: number
  whaleCount: number
  avgTransactionSize: number
  marketSentiment: 'bullish' | 'bearish' | 'neutral'
  topWhales: Array<{
    wallet: string
    balance: number
    change24h: number
  }>
  hourlyActivity: Array<{
    hour: number
    volume: number
    transactions: number
  }>
}

export default function WhaleAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Simulate analytics data
    const mockData: AnalyticsData = {
      totalVolume: 2400000,
      whaleCount: 1247,
      avgTransactionSize: 125000,
      marketSentiment: 'bullish',
      topWhales: [
        { wallet: '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m', balance: 2500000, change24h: 12.5 },
        { wallet: '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p', balance: 1800000, change24h: -3.2 },
        { wallet: '3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r', balance: 1600000, change24h: 8.7 },
        { wallet: '5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t', balance: 1400000, change24h: 15.3 },
        { wallet: '1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v', balance: 1200000, change24h: -1.8 }
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        volume: Math.floor(Math.random() * 200000) + 50000,
        transactions: Math.floor(Math.random() * 50) + 10
      }))
    }
    
    setAnalytics(mockData)
  }, [])

  if (!analytics) {
    return <div className="text-white">Loading analytics...</div>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
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
              ${formatNumber(analytics.totalVolume)}
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
              {analytics.whaleCount}
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
              {analytics.marketSentiment}
            </div>
            <Badge className={`${
              analytics.marketSentiment === 'bullish' 
                ? 'bg-green-500/20 text-green-400' 
                : analytics.marketSentiment === 'bearish'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {analytics.marketSentiment === 'bullish' && <TrendingUp className="h-3 w-3 mr-1" />}
              {analytics.marketSentiment === 'bearish' && <TrendingDown className="h-3 w-3 mr-1" />}
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
          <div className="space-y-4">
            {analytics.topWhales.map((whale, index) => (
              <div
                key={whale.wallet}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {formatWallet(whale.wallet)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatNumber(whale.balance)} $CHONK9K
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${
                    whale.change24h >= 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {whale.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {whale.change24h >= 0 ? '+' : ''}{whale.change24h.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
