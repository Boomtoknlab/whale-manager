import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  
  // Solana Configuration
  SOLANA_RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  CHONK9K_MINT: z.string().default('DnUsQnwNot38V9JbisNC18VHZkae1eKK5N2Dgy55pump'),
  WHALE_THRESHOLD: z.string().transform(Number).default(100000),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  
  // Notification Configuration
  DISCORD_WEBHOOK_URL: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})

export const config = configSchema.parse(process.env)
