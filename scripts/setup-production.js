#!/usr/bin/env node

import { execSync } from 'child_process'
import { writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function setupProduction() {
  console.log('🚀 Setting up $CHONK9K Whale Manager for production...\n')

  // Collect environment variables
  const env = {}
  
  console.log('📝 Please provide the following environment variables:\n')
  
  env.DATABASE_URL = await question('Database URL (Neon): ')
  env.SESSION_SECRET = await question('Session Secret (random string): ')
  env.STRIPE_SECRET_KEY = await question('Stripe Secret Key: ')
  env.STRIPE_WEBHOOK_SECRET = await question('Stripe Webhook Secret: ')
  env.DISCORD_WEBHOOK_URL = await question('Discord Webhook URL (optional): ')
  env.SOLANA_RPC_URL = await question('Solana RPC URL (default: mainnet): ') || 'https://api.mainnet-beta.solana.com'
  
  // Generate .env file
  const envContent = Object.entries(env)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  writeFileSync('.env', envContent)
  console.log('\n✅ Environment file created')
  
  // Install dependencies
  console.log('\n📦 Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  
  // Run database migrations
  console.log('\n🗄️ Setting up database...')
  try {
    execSync('npm run db:generate', { stdio: 'inherit' })
    execSync('npm run db:push', { stdio: 'inherit' })
    console.log('✅ Database setup complete')
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
  }
  
  // Build application
  console.log('\n🔨 Building application...')
  try {
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Build complete')
  } catch (error) {
    console.error('❌ Build failed:', error.message)
  }
  
  console.log('\n🎉 Production setup complete!')
  console.log('\nNext steps:')
  console.log('1. Configure your Stripe products and webhooks')
  console.log('2. Set up your domain and SSL certificates')
  console.log('3. Deploy using: npm start')
  console.log('4. Monitor logs and set up alerts')
  
  rl.close()
}

setupProduction().catch(console.error)
