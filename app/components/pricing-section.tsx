import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for casual traders getting started",
    features: [
      "Track up to 10 whales",
      "5 alerts per day",
      "Basic whale activity feed",
      "Community Discord access",
      "Mobile responsive dashboard"
    ],
    cta: "Start Free",
    popular: false,
    color: "border-white/20"
  },
  {
    name: "Basic",
    price: "$29.99",
    period: "per month",
    description: "For active traders who need more data",
    features: [
      "Track up to 50 whales",
      "Unlimited alerts",
      "Historical data (30 days)",
      "Export data (CSV, JSON)",
      "Price tracking & charts",
      "Email & Discord alerts",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: false,
    color: "border-blue-500/50"
  },
  {
    name: "Pro",
    price: "$99.99",
    period: "per month",
    description: "Professional traders and small firms",
    features: [
      "Track unlimited whales",
      "Advanced analytics & insights",
      "Historical data (1 year)",
      "Custom alert conditions",
      "API access (10K calls/month)",
      "Telegram & SMS alerts",
      "Portfolio tracking",
      "Trading signals",
      "White-label options"
    ],
    cta: "Start Free Trial",
    popular: true,
    color: "border-orange-500"
  },
  {
    name: "Enterprise",
    price: "$299.99",
    period: "per month",
    description: "Large firms and institutions",
    features: [
      "Everything in Pro",
      "AI-powered insights",
      "Unlimited API calls",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "Custom branding",
      "Advanced security features",
      "Priority feature requests"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "border-purple-500/50"
  }
]

export default function PricingSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan, index) => (
        <Card 
          key={index} 
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
            >
              {plan.cta}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
