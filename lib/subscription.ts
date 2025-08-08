export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'

export interface SubscriptionLimits {
  maxWhales: number
  maxAlerts: number
  apiCallsPerMonth: number
  historicalDataDays: number
  features: string[]
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxWhales: 10,
    maxAlerts: 5,
    apiCallsPerMonth: 1000,
    historicalDataDays: 7,
    features: ['basic_tracking', 'discord_alerts', 'mobile_dashboard']
  },
  basic: {
    maxWhales: 50,
    maxAlerts: 25,
    apiCallsPerMonth: 10000,
    historicalDataDays: 30,
    features: ['basic_tracking', 'discord_alerts', 'email_alerts', 'export_data', 'price_tracking']
  },
  pro: {
    maxWhales: -1, // unlimited
    maxAlerts: 100,
    apiCallsPerMonth: 100000,
    historicalDataDays: 365,
    features: [
      'advanced_analytics', 'custom_alerts', 'api_access', 'telegram_alerts', 
      'sms_alerts', 'portfolio_tracking', 'trading_signals', 'white_label'
    ]
  },
  enterprise: {
    maxWhales: -1,
    maxAlerts: -1,
    apiCallsPerMonth: -1,
    historicalDataDays: -1,
    features: [
      'ai_insights', 'custom_integrations', 'dedicated_support', 'sla_guarantee',
      'custom_branding', 'priority_features', 'advanced_security'
    ]
  }
}

export interface UserSubscription {
  userId: string
  tier: SubscriptionTier
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
}

export class SubscriptionManager {
  static checkLimit(subscription: UserSubscription, limitType: keyof SubscriptionLimits, currentUsage: number): boolean {
    const limits = SUBSCRIPTION_LIMITS[subscription.tier]
    const limit = limits[limitType] as number
    
    if (limit === -1) return true // unlimited
    return currentUsage < limit
  }

  static hasFeature(subscription: UserSubscription, feature: string): boolean {
    const limits = SUBSCRIPTION_LIMITS[subscription.tier]
    return limits.features.includes(feature)
  }

  static getUpgradeRecommendation(currentTier: SubscriptionTier, requiredFeature: string): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise']
    const currentIndex = tiers.indexOf(currentTier)
    
    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const tier = tiers[i]
      if (SUBSCRIPTION_LIMITS[tier].features.includes(requiredFeature)) {
        return tier
      }
    }
    
    return null
  }
}
