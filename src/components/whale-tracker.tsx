// src/components/whale-tracker.tsx
import React, { useState, useEffect } from ‘react’;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from “@/components/ui/card”;
import { Badge } from “@/components/ui/badge”;
import { Button } from “@/components/ui/button”;
import { TrendingUp, TrendingDown, ExternalLink, Copy } from ‘lucide-react’;

interface Whale {
id: string;
address: string;
balance: number;
balanceUSD: number;
percentageOfSupply: number;
lastActivity: string;
change24h: number;
transactions: number;
isActive: boolean;
}

const WhaleTracker = () => {
const [whales, setWhales] = useState<Whale[]>([]);
const [loading, setLoading] = useState(true);

// Mock data - replace with actual API call
useEffect(() => {
const mockWhales: Whale[] = [
{
id: ‘1’,
address: ‘7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p’,
balance: 1250000,
balanceUSD: 45680,
percentageOfSupply: 2.3,
lastActivity: ‘2 minutes ago’,
change24h: 12.5,
transactions: 47,
isActive: true
},
{
id: ‘2’,
address: ‘8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r’,
balance: 980000,
balanceUSD: 35820,
percentageOfSupply: 1.8,
lastActivity: ‘15 minutes ago’,
change24h: -5.2,
transactions: 23,
isActive: true
},
{
id: ‘3’,
address: ‘9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s’,
balance: 750000,
balanceUSD: 27450,
percentageOfSupply: 1.4,
lastActivity: ‘1 hour ago’,
change24h: 8.7,
transactions: 31,
isActive: false
},
{
id: ‘4’,
address: ‘0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t’,
balance: 680000,
balanceUSD: 24860,
percentageOfSupply: 1.2,
lastActivity: ‘3 hours ago’,
change24h: -2.1,
transactions: 19,
isActive: true
},
{
id: ‘5’,
address: ‘1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u’,
balance: 520000,
balanceUSD: 19030,
percentageOfSupply: 1.0,
lastActivity: ‘6 hours ago’,
change24h: 15.3,
transactions: 12,
isActive: true
}
];

```
// Simulate loading delay
setTimeout(() => {
  setWhales(mockWhales);
  setLoading(false);
}, 1000);
```

}, []);

const copyToClipboard = (text: string) => {
navigator.clipboard.writeText(text);
};

const formatAddress = (address: string) => {
return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

if (loading) {
return (
<Card className="bg-black/40 border-white/10">
<CardHeader>
<CardTitle className="text-white">Whale Tracker</CardTitle>
<CardDescription className="text-gray-400">
Real-time whale wallet monitoring
</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
{[…Array(5)].map((_, i) => (
<div key={i} className="animate-pulse">
<div className="h-16 bg-gray-700 rounded"></div>
</div>
))}
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
🐋 Whale Tracker
<Badge variant="secondary" className="bg-green-500/20 text-green-400">
Live
</Badge>
</CardTitle>
<CardDescription className="text-gray-400">
Real-time whale wallet monitoring for CHONK9K
</CardDescription>
</div>
<Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
View All
</Button>
</div>
</CardHeader>
<CardContent>
<div className="space-y-4">
{whales.map((whale) => (
<div key={whale.id} className="p-4 rounded-lg border border-white/10 bg-black/20">
<div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-2">
<code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
{formatAddress(whale.address)}
</code>
<Button
variant=“ghost”
size=“icon”
className=“h-6 w-6 text-gray-400 hover:text-white”
onClick={() => copyToClipboard(whale.address)}
>
<Copy className="h-3 w-3" />
</Button>
<Button 
variant="ghost" 
size="icon" 
className="h-6 w-6 text-gray-400 hover:text-white"
>
<ExternalLink className="h-3 w-3" />
</Button>
</div>
<div className={`flex items-center gap-1 ${whale.isActive ? 'text-green-400' : 'text-gray-400'}`}>
<div className={`w-2 h-2 rounded-full ${whale.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
<span className="text-xs">{whale.isActive ? ‘Active’ : ‘Inactive’}</span>
</div>
</div>

```
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Balance</p>
              <p className="text-white font-semibold">{whale.balance.toLocaleString()} CHONK</p>
              <p className="text-gray-400 text-xs">${whale.balanceUSD.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Supply %</p>
              <p className="text-white font-semibold">{whale.percentageOfSupply}%</p>
            </div>
            <div>
              <p className="text-gray-400">24h Change</p>
              <div className={`flex items-center gap-1 ${whale.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {whale.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="font-semibold">{whale.change24h.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400">Last Activity</p>
              <p className="text-white text-xs">{whale.lastActivity}</p>
              <p className="text-gray-400 text-xs">{whale.transactions} transactions</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

);
};

export default WhaleTracker;
