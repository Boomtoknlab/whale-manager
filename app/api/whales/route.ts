import { NextResponse } from 'next/server'

// Mock whale data - in production, this would connect to Solana RPC
const mockWhales = [
  {
    id: '1',
    wallet: '7x8y9z1a2b3c4d5e6f7g8h9i0j1k2l3m',
    balance: 2500000,
    change24h: 12.5,
    lastActivity: new Date().toISOString(),
    transactions24h: 15
  },
  {
    id: '2',
    wallet: '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p',
    balance: 1800000,
    change24h: -3.2,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    transactions24h: 8
  },
  {
    id: '3',
    wallet: '3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r',
    balance: 1600000,
    change24h: 8.7,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    transactions24h: 22
  }
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: mockWhales,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch whale data' },
      { status: 500 }
    )
  }
}
