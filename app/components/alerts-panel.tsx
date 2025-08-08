"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, Plus, Settings, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from "react"

interface Alert {
  id: string
  name: string
  condition: string
  isActive: boolean
  triggered: number
  lastTriggered?: Date
  type: 'buy' | 'sell' | 'balance' | 'volume'
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Large Buy Alert',
      condition: 'When any whale buys > 100K tokens',
      isActive: true,
      triggered: 12,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'buy'
    },
    {
      id: '2',
      name: 'Whale Dump Warning',
      condition: 'When any whale sells > 250K tokens',
      isActive: true,
      triggered: 3,
      lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'sell'
    },
    {
      id: '3',
      name: 'New Whale Detection',
      condition: 'When wallet balance exceeds 500K tokens',
      isActive: false,
      triggered: 8,
      lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'balance'
    },
    {
      id: '4',
      name: 'Volume Spike Alert',
      condition: 'When hourly volume > $500K',
      isActive: true,
      triggered: 5,
      lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'volume'
    }
  ])

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'balance':
        return <Bell className="h-4 w-4 text-blue-400" />
      case 'volume':
        return <TrendingUp className="h-4 w-4 text-purple-400" />
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'sell':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'balance':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'volume':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {alerts.filter(a => a.isActive).length}
            </div>
            <p className="text-sm text-gray-400">
              {alerts.length} total configured
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Triggered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {alerts.reduce((sum, alert) => sum + alert.triggered, 0)}
            </div>
            <p className="text-sm text-green-400">
              +23% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">94.2%</div>
            <p className="text-sm text-gray-400">
              Profitable signals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Management */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Alert Management</CardTitle>
              <CardDescription className="text-gray-400">
                Configure and manage your whale tracking alerts
              </CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{alert.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.triggered} triggered
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {alert.condition}
                    </div>
                    {alert.lastTriggered && (
                      <div className="text-xs text-gray-500">
                        Last triggered: {alert.lastTriggered.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <span className="text-sm text-gray-400">
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Alert Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest triggered alerts and their outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '2 hours ago',
                alert: 'Large Buy Alert',
                message: 'Whale 7x8y...3m bought 150K tokens',
                outcome: 'Price +12% in 1h',
                success: true
              },
              {
                time: '4 hours ago',
                alert: 'Volume Spike Alert',
                message: 'Hourly volume reached $650K',
                outcome: 'Continued momentum',
                success: true
              },
              {
                time: '6 hours ago',
                alert: 'Whale Dump Warning',
                message: 'Whale 9a8b...4p sold 300K tokens',
                outcome: 'Price -8% in 30min',
                success: true
              }
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={activity.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {activity.alert}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <div className="text-sm text-gray-300">{activity.message}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${activity.success ? 'text-green-400' : 'text-red-400'}`}>
                    {activity.outcome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
