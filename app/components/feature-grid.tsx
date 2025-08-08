import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BarChart3, Zap, Shield, Smartphone, Bot, TrendingUp, Users, Globe, Database, Clock, Target } from 'lucide-react'

const features = [
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Instant notifications via Discord, Telegram, Email, and SMS when whales move.",
    color: "text-blue-400"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Professional-grade charts, trend analysis, and market sentiment tracking.",
    color: "text-green-400"
  },
  {
    icon: Bot,
    title: "AI-Powered Insights",
    description: "Machine learning algorithms predict whale behavior and market movements.",
    color: "text-purple-400"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times with 99.9% uptime and automatic failover.",
    color: "text-yellow-400"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with JWT authentication and encrypted data storage.",
    color: "text-red-400"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Responsive design works perfectly on all devices with native app coming soon.",
    color: "text-cyan-400"
  },
  {
    icon: Database,
    title: "Historical Data",
    description: "Access months of whale activity data with advanced filtering and export options.",
    color: "text-indigo-400"
  },
  {
    icon: Globe,
    title: "API Access",
    description: "RESTful API with WebSocket support for building custom integrations.",
    color: "text-pink-400"
  },
  {
    icon: Target,
    title: "Custom Alerts",
    description: "Build complex alert conditions with multiple triggers and actions.",
    color: "text-orange-400"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share whale lists, alerts, and insights with your trading team.",
    color: "text-teal-400"
  },
  {
    icon: TrendingUp,
    title: "Trading Signals",
    description: "Automated trading signals based on whale movements and market analysis.",
    color: "text-emerald-400"
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous monitoring with automatic recovery and health checks.",
    color: "text-violet-400"
  }
]

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="bg-black/40 border-white/10 hover:bg-black/60 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/10 ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-300">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
