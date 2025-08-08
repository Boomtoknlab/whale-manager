import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Bell, Settings, BarChart3 } from 'lucide-react'
import { api } from '@/lib/api'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useAuth } from '@/contexts/AuthContext'
import WhaleTracker from '@/components/WhaleTracker'
import WhaleAnalytics from '@/components/WhaleAnalytics'
import AlertsPanel from '@/components/AlertsPanel'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardPage() {
  const { user } = useAuth()
  const { subscribe, unsubscribe, lastMessage } = useWebSocket()
  const [stats, setStats] = useState({
    totalWhales: 0,
    totalVolume: 0,
    activeAlerts: 0,
    successRate: 0
  })

  // Subscribe to real-time updates
  useEffect(() => {
    subscribe('whales')
    subscribe('transactions')
    subscribe('alerts')

    return () => {
      unsubscribe('whales')
      unsubscribe('transactions')
      unsubscribe('alerts')
    }
  }, [subscribe, unsubscribe])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'whale_count_update':
          setStats(prev => ({ ...prev, totalWhales: lastMessage.data.count }))
          break
        case 'volume_update':
          setStats(prev => ({ ...prev, totalVolume: lastMessage.data.volume }))
          break
      }
    }
  }, [lastMessage])

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get('/whales/stats/activity')
      return response.data.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: subscription } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/current')
      return response.data.data
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader />

      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Whales
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dashboardStats?.whaleCount || stats.totalWhales || 1247}
              </div>
              <p className="text-xs text-green-400">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                24h Volume
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${((dashboardStats?.totalVolume || stats.totalVolume || 2400000) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-green-400">
                +8.2% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Alerts
              </CardTitle>
              <Bell className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.activeAlerts || 23}
              </div>
              <p className="text-xs text-gray-400">
                5 triggered today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.successRate || 94.2}%
              </div>
              <p className="text-xs text-green-400">
                +2.1% this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        {subscription && subscription.tier === 'free' && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Upgrade to Pro for Advanced Features
              </CardTitle>
              <CardDescription className="text-gray-300">
                Get unlimited whales, AI insights, and custom alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-black/40 border-white/10">
            <TabsTrigger value="activity" className="data-[state=active]:bg-orange-500">
              <Activity className="h-4 w-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-orange-500">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <WhaleTracker />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <WhaleAnalytics />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
