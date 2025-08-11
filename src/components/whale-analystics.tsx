// src/components/whale-analytics.tsx
import React, { useState, useEffect } from ‘react’;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from “@/components/ui/card”;
import { Badge } from “@/components/ui/badge”;
import { Button } from “@/components/ui/button”;
import { Tabs, TabsContent, TabsList, TabsTrigger } from “@/components/ui/tabs”;
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign } from ‘lucide-react’;

interface WhaleActivity {
id: string;
address: string;
type: ‘buy’ | ‘sell’ | ‘transfer’;
amount: number;
amountUSD: number;
price: number;
timestamp: string;
txHash: string;
}

interface Analytics {
totalVolume24h: number;
totalTransactions24h: number;
avgTransactionSize: number;
priceImpact: number;
sentiment: ‘bullish’ | ‘bearish’ | ‘neutral’;
whaleCount: number;
topMovers: {
address: string;
change: number;
volume: number;
}[];
}

const WhaleAnalytics = () => {
const [activities, setActivities] = useState<WhaleActivity[]>([]);
const [analytics, setAnalytics] = useState<Analytics | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Mock data - replace with actual API calls
const mockActivities: WhaleActivity[] = [
{
id: ‘1’,
address: ‘7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p’,
type: ‘buy’,
amount: 150000,
amountUSD: 5475,
price: 0.0365,
timestamp: ‘2 minutes ago’,
txHash: ‘abc123…’
},
{
id: ‘2’,
address: ‘8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r’,
type: ‘sell’,
amount: 85000,
amountUSD: 3102.5,
price: 0.0365,
timestamp: ‘5 minutes ago’,
txHash: ‘def456…’
},
{
id: ‘3’,
address: ‘9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s’,
type: ‘buy’,
amount: 200000,
amountUSD: 7300,
price: 0.0365,
timestamp: ‘8 minutes ago’,
txHash: ‘ghi789…’
},
{
id: ‘4’,
address: ‘0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t’,
type: ‘transfer’,
amount: 50000,
amountUSD: 1825,
price: 0.0365,
timestamp: ‘12 minutes ago’,
txHash: ‘jkl012…’
},
{
id: ‘5’,
address: ‘1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u’,
type: ‘buy’,
amount: 120000,
amountUSD: 4380,
price: 0.0365,
timestamp: ‘15 minutes ago’,
txHash: ‘mno345…’
}
];

```
const mockAnalytics: Analytics = {
  totalVolume24h: 2450000,
  totalTransactions24h: 147,
  avgTransactionSize: 16667,
  priceImpact: 2.3,
  sentiment: 'bullish',
  whaleCount: 1247,
  topMovers: [
    { address: '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', change: 15.3, volume: 450000 },
    { address: '8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r', change: 12.7, volume: 380000 },
    { address: '9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s', change: 8.9, volume: 320000 }
  ]
};

setTimeout(() => {
  setActivities(mockActivities);
  setAnalytics(mockAnalytics);
  setLoading(false);
}, 1200);
```

}, []);

const formatAddress = (address: string) => {
return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

const getActivityIcon = (type: string) => {
switch (type) {
case ‘buy’:
return <TrendingUp className="h-4 w-4 text-green-400" />;
case ‘sell’:
return <TrendingDown className="h-4 w-4 text-red-400" />;
case ‘transfer’:
return <Activity className="h-4 w-4 text-blue-400" />;
default:
return <Activity className="h-4 w-4 text-gray-400" />;
}
};

const getActivityColor = (type: string) => {
switch (type) {
case ‘buy’:
return ‘text-green-400 bg-green-400/10’;
case ‘sell’:
return ‘text-red-400 bg-red-400/10’;
case ‘transfer’:
return ‘text-blue-400 bg-blue-400/10’;
default:
return ‘text-gray-400 bg-gray-400/10’;
}
};

if (loading) {
return (
<Card className="bg-black/40 border-white/10">
<CardHeader>
<CardTitle className="text-white">Whale Analytics</CardTitle>
</CardHeader>
<CardContent>
<div className="animate-pulse space-y-4">
<div className="grid grid-cols-3 gap-4">
{[…Array(3)].map((*, i) => (
<div key={i} className="h-20 bg-gray-700 rounded"></div>
))}
</div>
<div className="space-y-3">
{[…Array(5)].map((*, i) => (
<div key={i} className="h-12 bg-gray-700 rounded"></div>
))}
</div>
</div>
</CardContent>
</Card>
);
}

return (
<Card className="bg-black/40 border-white/10">
<CardHeader>
<div className="flex items-center justify-between">
<div>
<CardTitle className="text-white flex items-center gap-2">
<BarChart3 className="h-5 w-5" />
Whale Analytics
</CardTitle>
<CardDescription className="text-gray-400">
Advanced insights and whale behavior patterns
</CardDescription>
</div>
<Badge
className={`${ analytics?.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' : analytics?.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400' }`}
>
{analytics?.sentiment.toUpperCase()}
</Badge>
</div>
</CardHeader>
<CardContent>
<Tabs defaultValue="activity" className="w-full">
<TabsList className="grid w-full grid-cols-3 bg-black/20">
<TabsTrigger value="activity" className="data-[state=active]:bg-white/10">Activity</TabsTrigger>
<TabsTrigger value="analytics" className="data-[state=active]:bg-white/10">Analytics</TabsTrigger>
<TabsTrigger value="movers" className="data-[state=active]:bg-white/10">Top Movers</TabsTrigger>
</TabsList>

```
      <TabsContent value="activity" className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                      {formatAddress(activity.address)}
                    </code>
                    <Badge size="sm" className={getActivityColor(activity.type)}>
                      {activity.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {activity.amount.toLocaleString()} CHONK
                </p>
                <p className="text-xs text-gray-400">
                  ${activity.amountUSD.toLocaleString()} @ ${activity.price.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">24h Volume</span>
            </div>
            <p className="text-xl font-bold text-white">
              {analytics?.totalVolume24h.toLocaleString()} CHONK
            </p>
            <p className="text-xs text-green-400">+12.5% from yesterday</p>
          </div>

          <div className="p-4 rounded-lg border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Transactions</span>
            </div>
            <p className="text-xl font-bold text-white">
              {analytics?.totalTransactions24h}
            </p>
            <p className="text-xs text-blue-400">Last 24 hours</p>
          </div>

          <div className="p-4 rounded-lg border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Avg Transaction</span>
            </div>
            <p className="text-xl font-bold text-white">
              {analytics?.avgTransactionSize.toLocaleString()} CHONK
            </p>
            <p className="text-xs text-purple-400">Per transaction</p>
          </div>

          <div className="p-4 rounded-lg border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-400">Price Impact</span>
            </div>
            <p className="text-xl font-bold text-white">
              {analytics?.priceImpact}%
            </p>
            <p className="text-xs text-orange-400">Market influence</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="movers" className="space-y-4">
        <div className="space-y-3">
          {analytics?.topMovers.map((mover, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
                  {formatAddress(mover.address)}
                </code>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-semibold">+{mover.change}%</span>
                </div>
                <p className="text-xs text-gray-400">
                  {mover.volume.toLocaleString()} CHONK volume
                </p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

);
};

export default WhaleAnalytics;
