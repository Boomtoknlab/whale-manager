// src/components/alerts-panel.tsx
import React, { useState, useEffect } from ‘react’;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from “@/components/ui/card”;
import { Badge } from “@/components/ui/badge”;
import { Button } from “@/components/ui/button”;
import { Switch } from “@/components/ui/switch”;
import { Bell, BellOff, AlertTriangle, TrendingUp, TrendingDown, Settings, Plus } from ‘lucide-react’;

interface Alert {
id: string;
type: ‘whale_movement’ | ‘price_change’ | ‘volume_spike’ | ‘large_transaction’;
title: string;
description: string;
timestamp: string;
priority: ‘low’ | ‘medium’ | ‘high’ | ‘critical’;
isRead: boolean;
data: {
address?: string;
amount?: number;
price?: number;
change?: number;
};
}

interface AlertSetting {
id: string;
name: string;
description: string;
enabled: boolean;
threshold: string;
type: ‘whale_movement’ | ‘price_change’ | ‘volume_spike’ | ‘large_transaction’;
}

const AlertsPanel = () => {
const [alerts, setAlerts] = useState<Alert[]>([]);
const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState<‘alerts’ | ‘settings’>(‘alerts’);

useEffect(() => {
// Mock data - replace with actual API calls
const mockAlerts: Alert[] = [
{
id: ‘1’,
type: ‘whale_movement’,
title: ‘Large Whale Purchase’,
description: ‘Whale bought 250K CHONK9K tokens’,
timestamp: ‘2 minutes ago’,
priority: ‘high’,
isRead: false,
data: {
address: ‘7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p’,
amount: 250000,
price: 0.0365
}
},
{
id: ‘2’,
type: ‘price_change’,
title: ‘Price Alert Triggered’,
description: ‘CHONK9K price increased by 15% in the last hour’,
timestamp: ‘5 minutes ago’,
priority: ‘medium’,
isRead: false,
data: {
price: 0.0365,
change: 15.2
}
},
{
id: ‘3’,
type: ‘volume_spike’,
title: ‘Volume Spike Detected’,
description: ‘Trading volume increased by 300% in the last 30 minutes’,
timestamp: ‘8 minutes ago’,
priority: ‘high’,
isRead: true,
data: {
change: 300
}
},
{
id: ‘4’,
type: ‘large_transaction’,
title: ‘Large Transaction’,
description: ‘Transaction of 180K CHONK9K detected’,
timestamp: ‘12 minutes ago’,
priority: ‘medium’,
isRead: true,
data: {
amount: 180000,
address: ‘9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s’
}
},
{
id: ‘5’,
type: ‘whale_movement’,
title: ‘Whale Sell-off’,
description: ‘Major whale sold 500K CHONK9K tokens’,
timestamp: ‘25 minutes ago’,
priority: ‘critical’,
isRead: true,
data: {
address: ‘8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r’,
amount: 500000,
price: 0.0358
}
}
];

```
const mockAlertSettings: AlertSetting[] = [
  {
    id: '1',
    name: 'Whale Movement',
    description: 'Get notified when whales buy or sell large amounts',
    enabled: true,
    threshold: '100K CHONK9K',
    type: 'whale_movement'
  },
  {
    id: '2',
    name: 'Price Changes',
    description: 'Alert when price changes exceed threshold',
    enabled: true,
    threshold: '10%',
    type: 'price_change'
  },
  {
    id: '3',
    name: 'Volume Spikes',
    description: 'Notify when trading volume increases significantly',
    enabled: false,
    threshold: '200%',
    type: 'volume_spike'
  },
  {
    id: '4',
    name: 'Large Transactions',
    description: 'Alert for transactions above specified amount',
    enabled: true,
    threshold: '50K CHONK9K',
    type: 'large_transaction'
  }
];

setTimeout(() => {
  setAlerts(mockAlerts);
  setAlertSettings(mockAlertSettings);
  setLoading(false);
}, 800);
```

}, []);

const getPriorityColor = (priority: string) => {
switch (priority) {
case ‘critical’:
return ‘bg-red-500/20 text-red-400 border-red-500/30’;
case ‘high’:
return ‘bg-orange-500/20 text-orange-400 border-orange-500/30’;
case ‘medium’:
return ‘bg-yellow-500/20 text-yellow-400 border-yellow-500/30’;
case ‘low’:
return ‘bg-blue-500/20 text-blue-400 border-blue-500/30’;
default:
return ‘bg-gray-500/20 text-gray-400 border-gray-500/30’;
}
};

const getAlertIcon = (type: string) => {
switch (type) {
case ‘whale_movement’:
return <TrendingUp className="h-4 w-4" />;
case ‘price_change’:
return <TrendingDown className="h-4 w-4" />;
case ‘volume_spike’:
return <AlertTriangle className="h-4 w-4" />;
case ‘large_transaction’:
return <Bell className="h-4 w-4" />;
default:
return <Bell className=“h-4 w
