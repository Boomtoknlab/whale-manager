import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Bell, Plus, Settings, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Alert {
  id: string
  name: string
  description?: string
  conditions: Array<{
    type: 'balance' | 'transaction' | 'price' | 'volume'
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number
    timeframe?: string
  }>
  actions: string[]
  isActive: boolean
  triggeredCount: number
  lastTriggered?: string
}

export default function AlertsPanel() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts')
      return response.data.data
    }
  })

  const toggleAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.patch(`/alerts/${alertId}/toggle`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast({
        title: 'Alert updated',
        description: 'Alert status has been changed'
      })
    }
  })

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.delete(`/alerts/${alertId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast({
        title: 'Alert deleted',
        description: 'Alert has been permanently deleted'
      })
    }
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'balance':
        return <Bell className="h-4 w-4 text-blue-400" />
      case 'price':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'volume':
        return <TrendingUp className="h-4 w-4 text-purple-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'balance':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'price':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'volume':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
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
              {alerts?.filter((a: Alert) => a.isActive).length || 0}
            </div>
            <p className="text-sm text-gray-400">
              {alerts?.length || 0} total configured
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Triggered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {alerts?.reduce((sum: number, alert: Alert) => sum + alert.triggeredCount, 0) || 0}
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-white/10 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set up a new whale tracking alert with custom conditions
                  </DialogDescription>
                </DialogHeader>
                <CreateAlertForm onClose={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: Alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getAlertColor(alert.conditions[0]?.type || 'balance')}`}>
                      {getAlertIcon(alert.conditions[0]?.type || 'balance')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{alert.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {alert.triggeredCount} triggered
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">
                        {alert.description || 'No description'}
                      </div>
                      {alert.lastTriggered && (
                        <div className="text-xs text-gray-500">
                          Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => toggleAlertMutation.mutate(alert.id)}
                        disabled={toggleAlertMutation.isPending}
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
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Alerts Configured
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first alert to start tracking whale movements
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CreateAlertForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: [{
      type: 'transaction' as const,
      operator: '>' as const,
      value: 100000,
      timeframe: '1h'
    }],
    actions: ['discord']
  })

  const createAlertMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/alerts', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast({
        title: 'Alert created',
        description: 'Your new alert has been created successfully'
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create alert',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createAlertMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Alert Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white/10 border-white/20 text-white"
            placeholder="Large Buy Alert"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Condition Type</Label>
          <Select
            value={formData.conditions[0].type}
            onValueChange={(value: any) => 
              setFormData(prev => ({
                ...prev,
                conditions: [{ ...prev.conditions[0], type: value }]
              }))
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10">
              <SelectItem value="transaction">Transaction Size</SelectItem>
              <SelectItem value="balance">Whale Balance</SelectItem>
              <SelectItem value="price">Price Change</SelectItem>
              <SelectItem value="volume">Volume Spike</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-white/10 border-white/20 text-white"
          placeholder="Alert when any whale buys more than 100K tokens"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="operator">Operator</Label>
          <Select
            value={formData.conditions[0].operator}
            onValueChange={(value: any) => 
              setFormData(prev => ({
                ...prev,
                conditions: [{ ...prev.conditions[0], operator: value }]
              }))
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10">
              <SelectItem value=">">Greater than</SelectItem>
              <SelectItem value="<">Less than</SelectItem>
              <SelectItem value=">=">Greater or equal</SelectItem>
              <SelectItem value="<=">Less or equal</SelectItem>
              <SelectItem value="=">Equal to</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            value={formData.conditions[0].value}
            onChange={(e) => 
              setFormData(prev => ({
                ...prev,
                conditions: [{ ...prev.conditions[0], value: Number(e.target.value) }]
              }))
            }
            className="bg-white/10 border-white/20 text-white"
            placeholder="100000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select
            value={formData.conditions[0].timeframe}
            onValueChange={(value: any) => 
              setFormData(prev => ({
                ...prev,
                conditions: [{ ...prev.conditions[0], timeframe: value }]
              }))
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10">
              <SelectItem value="1m">1 minute</SelectItem>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Notification Channels</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'discord', label: 'Discord' },
            { id: 'telegram', label: 'Telegram' },
            { id: 'email', label: 'Email' },
            { id: 'sms', label: 'SMS' }
          ].map((channel) => (
            <div key={channel.id} className="flex items-center space-x-2">
              <Checkbox
                id={channel.id}
                checked={formData.actions.includes(channel.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      actions: [...prev.actions, channel.id]
                    }))
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      actions: prev.actions.filter(a => a !== channel.id)
                    }))
                  }
                }}
              />
              <Label htmlFor={channel.id} className="text-white">
                {channel.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createAlertMutation.isPending}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
        </Button>
      </div>
    </form>
  )
}
