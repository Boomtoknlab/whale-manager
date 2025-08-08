import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for casual traders getting started',
    priceId: null,
    features: [
      'Track up to 10 whales',
      '5 alerts per day',
      'Basic whale activity feed',
      'Community Discord access',
      'Mobile responsive dashboard'
    ],
    popular: false,
    color: 'border-white/20'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$29.99',
    period: 'per month',
    description: 'For active traders who need more data',
    priceId: 'price_basic_monthly',
    features: [
      'Track up to 50 whales',
      'Unlimited alerts',
      'Historical data (30 days)',
      'Export data (CSV, JSON)',
      'Price tracking & charts',
      'Email & Discord alerts',
      'Priority support'
    ],
    popular: false,
    color: 'border-blue-500/50'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99.99',
    period: 'per month',
    description: 'Professional traders and small firms',
    priceId: 'price_pro_monthly',
    features: [
      'Track unlimited whales',
      'Advanced analytics & insights',
      'Historical data (1 year)',
      'Custom alert conditions',
      'API access (10K calls/month)',
      'Telegram & SMS alerts',
      'Portfolio tracking',
      'Trading signals',
      'White-label options'
    ],
    popular: true,
    color: 'border-orange-500'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$299.99',
    period: 'per month',
    description: 'Large firms and institutions',
    priceId: 'price_enterprise_monthly',
    features: [
      'Everything in Pro',
      'AI-powered insights',
      'Unlimited API calls',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'Custom branding',
      'Advanced security features',
      'Priority feature requests'
    ],
    popular: false,
    color: 'border-purple-500/50'
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const { data: currentSubscription } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      if (!user) return null
      const response = await api.get('/subscriptions/current')
      return response.data.data
    },
    enabled: !!user
  })

  const checkoutMutation = useMutation({
    mutationFn: async ({ tier, priceId }: { tier: string; priceId: string }) => {
      const response = await api.post('/subscriptions/checkout', { tier, priceId })
      return response.data.data
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error)
    },
    onSettled: () => {
      setLoadingPlan(null)
    }
  })

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    if (!plan.priceId) return // Free plan

    setLoadingPlan(plan.id)
    checkoutMutation.mutate({
      tier: plan.id,
      priceId: plan.priceId
    })
  }

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.tier === planId
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">🐋</span>
            </div>
            <span className="font-bold text-xl text-white">$CHONK9K</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.location.href = '/dashboard'}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" onClick={() => window.location.href = '/signup'}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Start free, upgrade as you grow. All plans include core whale tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-black/40 ${plan.color} relative ${
                  plan.popular ? 'ring-2 ring-orange-500/50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.id || isCurrentPlan(plan.id)}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan(plan.id) ? (
                      'Current Plan'
                    ) : plan.id === 'free' ? (
                      'Get Started'
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Can I change plans anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate any billing differences.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Is there a free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    All paid plans come with a 7-day free trial. No credit card required for the free plan.
                    You can cancel anytime during the trial period.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                    All payments are processed securely through Stripe.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
