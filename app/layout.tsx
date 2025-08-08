import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "$CHONK9K Whale Manager - Professional Solana Whale Tracking",
  description: "Track $CHONK9K whales in real-time. Get instant alerts, AI-powered insights, and professional-grade analytics for Solana trading.",
  keywords: "solana, whale tracking, crypto, trading, $CHONK9K, DeFi, analytics",
  openGraph: {
    title: "$CHONK9K Whale Manager",
    description: "Professional Solana whale tracking platform",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
