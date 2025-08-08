import React from 'react'
import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, ExternalLink, Copy, ArrowLeft, Activity, BarChart3, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import DashboardHeader from '@/components/DashboardHeader'
import { useToast } from '@/hooks/use-toast'

export default function WhaleDetailPage() {
  const { address } = useParams<{ address: string }>()
  const { toast } = useToast()

  const { data: whaleData, isLoading } = useQuery({
    queryKey: ['whale', address],
    queryFn: async () => {
      const response = await api.get(`/whales/${address}`)
      return response.data.data
    },
    enabled: !!address
  })

  const { data: transactions } = useQuery({
    queryKey: ['whale', address, 'transactions'],
    queryFn: async () => {
      const response = await api.get(`/whales/${address}/transactions?limit=50`)
      return response.data.data
    },
    enabled: !!address
  })

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard'
      })
    }
  }

  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseFloat(num) : num
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
    return value.toLocaleString()
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 8)}...${wallet.slice(-8)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardHeader />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-white">Loading whale data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!whaleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardHeader />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Whale Not Found</h1>
            <p className="text-gray-300 mb-6">The whale address you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const whale = whaleData.whale
  const change24h = parseFloat(whale.change24h || '0')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader />

      <main className="container py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Whale Header */}
        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white mb-2">
                  🐋 Whale Details
                </CardTitle>
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-lg text-gray-300 bg-white/10 px-3 py-1 rounded">
                    {formatWallet(whale.address)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://solscan.io/account/${whale.address}`, '_blank')}
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-gray-400">
                  First seen: {new Date(whale.firstSeen).toLocaleDateString()}
                  {whale.lastActivity && (
                    <> • Last activity: {new Date(whale.lastActivity).toLocaleString()}</>
                  )}
                </CardDescription>
              </div>
              <Badge 
                className={`${
                  change24h >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Current Balance
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(whale.balance)} $CHONK9K
              </div>
              {whale.balanceUsd && (
                <p className="text-xs text-gray-400">
                  ≈ ${formatNumber(whale.balanceUsd)} USD
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                24h Transactions
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {whale.transactionCount24h || 0}
              </div>
              <p className="text-xs text-gray-400">
                Transactions today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                24h Change
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-400">
                Balance change
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-black/40 border-white/10">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-500">
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest transactions for this whale
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
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
                              <Badge 
                                variant={tx.type === 'buy' ? 'default' : 'destructive'}
                                className={tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                              >
                                {tx.type.toUpperCase()}
                              </Badge>
                              <span className="text-white font-medium">
                                {formatNumber(tx.amount)} $CHONK9K
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {tx.valueUsd && `$${formatNumber(tx.valueUsd)} • `}
                              {new Date(tx.blockTime).toLocaleString()}
                            </div>
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Whale Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced analytics and insights for this whale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Advanced Analytics Coming Soon
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Detailed whale behavior analysis, trading patterns, and predictive insights.
                  </p>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
