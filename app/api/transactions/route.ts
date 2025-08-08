import { NextResponse } from 'next/server'

// Mock transaction data
const generateMockTransaction = () => {
  const wallets = [
    '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m',
    '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p',
    '3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r',
    '5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t',
    '1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v'
  ]
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    wallet: wallets[Math.floor(Math.random() * wallets.length)],
    type: Math.random() > 0.6 ? 'buy' : 'sell',
    amount: Math.floor(Math.random() * 500000) + 100000,
    value: Math.floor(Math.random() * 50000) + 10000,
    timestamp: new Date().toISOString(),
    txHash: Math.random().toString(36).substr(2, 16),
    price: (Math.random() * 0.1 + 0.05).toFixed(6)
  }
}

export async function GET() {
  try {
    const transactions = Array.from({ length: 10 }, generateMockTransaction)
    
    return NextResponse.json({
      success: true,
      data: transactions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
