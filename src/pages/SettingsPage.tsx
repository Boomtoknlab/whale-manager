import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Bell, CreditCard, Shield, Trash2, Save, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import DashboardHeader from '@/components/DashboardHeader'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')

  const { data: subscription } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/current')
      return response.data.data
    }
  })

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts')
      return response.data.data
    }
  })

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await api.put('/auth/profile', data)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    }
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    discordAlerts: true,
    telegramAlerts: false,
    smsAlerts: false,
    whaleMovements: true,
    priceAlerts: true,
    volumeSpikes: true
  })

  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: typeof notificationSettings) => {
      const response = await api.put('/auth/notifications', settings)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Notifications updated',
        description: 'Your notification preferences have been saved'
      })
    }
  })

  // Subscription Management
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/cancel')
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription will be canceled at the end of the current period'
      })
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] })
    }
  })

  // Account Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/auth/account')
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted'
      })
      logout()
    }
  })

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData)
  }

  const handleNotificationUpdate = () => {
    updateNotificationsMutation.mutate(notificationSettings)
  }

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      cancelSubscriptionMutation.mutate()
    }
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      deleteAccountMutation.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-300">Manage your account, notifications, and subscription</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-black/40 border-white/10">
              <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-500">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-orange-500">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-orange-500">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how you want to receive alerts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Alert Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Email Alerts</Label>
                          <p className="text-sm text-gray-400">Receive alerts via email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, emailAlerts: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Discord Alerts</Label>
                          <p className="text-sm text-gray-400">Receive alerts via Discord webhook</p>
                        </div>
                        <Switch
                          checked={notificationSettings.discordAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, discordAlerts: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Telegram Alerts</Label>
                          <p className="text-sm text-gray-400">Receive alerts via Telegram bot</p>
                        </div>
                        <Switch
                          checked={notificationSettings.telegramAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, telegramAlerts: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">SMS Alerts</Label>
                          <p className="text-sm text-gray-400">Receive alerts via SMS (Pro plan)</p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, smsAlerts: checked }))
                          }
                          disabled={subscription?.tier === 'free' || subscription?.tier === 'basic'}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Alert Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Whale Movements</Label>
                          <p className="text-sm text-gray-400">Large buy/sell transactions</p>
                        </div>
                        <Switch
                          checked={notificationSettings.whaleMovements}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, whaleMovements: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Price Alerts</Label>
                          <p className="text-sm text-gray-400">Significant price changes</p>
                        </div>
                        <Switch
                          checked={notificationSettings.priceAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, priceAlerts: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Volume Spikes</Label>
                          <p className="text-sm text-gray-400">Unusual trading volume</p>
                        </div>
                        <Switch
                          checked={notificationSettings.volumeSpikes}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, volumeSpikes: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleNotificationUpdate}
                    disabled={updateNotificationsMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Settings */}
            <TabsContent value="subscription">
              <div className="space-y-6">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Current Subscription</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your subscription and billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-white capitalize">
                              {subscription.tier} Plan
                            </h3>
                            <p className="text-sm text-gray-400">
                              Status: <span className="capitalize">{subscription.status}</span>
                            </p>
                            {subscription.currentPeriodEnd && (
                              <p className="text-sm text-gray-400">
                                {subscription.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}: {' '}
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge 
                            className={`${
                              subscription.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {subscription.status}
                          </Badge>
                        </div>

                        <div className="flex gap-4">
                          {subscription.tier !== 'free' && !subscription.cancelAtPeriodEnd && (
                            <Button
                              variant="outline"
                              onClick={handleCancelSubscription}
                              disabled={cancelSubscriptionMutation.isPending}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
                            </Button>
                          )}
                          
                          <Button 
                            onClick={() => window.location.href = '/pricing'}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            {subscription.tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">No subscription found</p>
                        <Button 
                          onClick={() => window.location.href = '/pricing'}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          Choose a Plan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Usage Statistics</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your current usage and limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Whales Tracked</span>
                          <span className="text-white">
                            {alerts?.length || 0} / {subscription?.tier === 'free' ? '10' : subscription?.tier === 'basic' ? '50' : '∞'}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" 
                            style={{ 
                              width: subscription?.tier === 'free' 
                                ? `${Math.min((alerts?.length || 0) / 10 * 100, 100)}%`
                                : subscription?.tier === 'basic'
                                ? `${Math.min((alerts?.length || 0) / 50 * 100, 100)}%`
                                : '25%'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">API Calls This Month</span>
                          <span className="text-white">1,247 / 10,000</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[12%]" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card className="bg-black/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Password & Security</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Button 
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Change Password
                      </Button>
                      <p className="text-sm text-gray-400 mt-2">
                        Update your password to keep your account secure
                      </p>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Enable 2FA</p>
                          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white">Current Session</p>
                            <p className="text-sm text-gray-400">Chrome on Windows • Last active now</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-300">
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!showDeleteConfirm ? (
                      <div>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                        <p className="text-sm text-red-300 mt-2">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert className="border-red-500/50 bg-red-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-red-300">
                            This action cannot be undone. This will permanently delete your account,
                            remove all your data, and cancel any active subscriptions.
                          </AlertDescription>
                        </Alert>
                        
                        <div>
                          <Label className="text-red-400">
                            Type "DELETE" to confirm account deletion
                          </Label>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="bg-red-500/10 border-red-500/50 text-white mt-2"
                            placeholder="DELETE"
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE' || deleteAccountMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteConfirmText('')
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
