import { pgTable, text, integer, timestamp, boolean, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}))

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tier: text('tier', { enum: ['free', 'basic', 'pro', 'enterprise'] }).notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status', { enum: ['active', 'canceled', 'past_due', 'unpaid'] }).notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('subscriptions_user_idx').on(table.userId),
  stripeCustomerIdx: index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
}))

// Whales table
export const whales = pgTable('whales', {
  id: uuid('id').primaryKey().defaultRandom(),
  address: text('address').unique().notNull(),
  balance: decimal('balance', { precision: 20, scale: 6 }).notNull(),
  balanceUsd: decimal('balance_usd', { precision: 15, scale: 2 }),
  change24h: decimal('change_24h', { precision: 10, scale: 4 }),
  transactionCount24h: integer('transaction_count_24h').default(0),
  lastActivity: timestamp('last_activity'),
  firstSeen: timestamp('first_seen').defaultNow(),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  addressIdx: index('whales_address_idx').on(table.address),
  balanceIdx: index('whales_balance_idx').on(table.balance),
  lastActivityIdx: index('whales_last_activity_idx').on(table.lastActivity),
}))

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  signature: text('signature').unique().notNull(),
  whaleAddress: text('whale_address').references(() => whales.address).notNull(),
  type: text('type', { enum: ['buy', 'sell', 'transfer'] }).notNull(),
  amount: decimal('amount', { precision: 20, scale: 6 }).notNull(),
  price: decimal('price', { precision: 15, scale: 8 }),
  valueUsd: decimal('value_usd', { precision: 15, scale: 2 }),
  blockTime: timestamp('block_time').notNull(),
  slot: integer('slot'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  signatureIdx: index('transactions_signature_idx').on(table.signature),
  whaleIdx: index('transactions_whale_idx').on(table.whaleAddress),
  blockTimeIdx: index('transactions_block_time_idx').on(table.blockTime),
  typeIdx: index('transactions_type_idx').on(table.type),
}))

// Alerts table
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  conditions: jsonb('conditions').notNull(),
  actions: jsonb('actions').notNull(),
  isActive: boolean('is_active').default(true),
  triggeredCount: integer('triggered_count').default(0),
  lastTriggered: timestamp('last_triggered'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('alerts_user_idx').on(table.userId),
  activeIdx: index('alerts_active_idx').on(table.isActive),
}))

// Alert triggers table
export const alertTriggers = pgTable('alert_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id').references(() => alerts.id).notNull(),
  triggeredAt: timestamp('triggered_at').defaultNow(),
  conditions: jsonb('conditions').notNull(),
  data: jsonb('data').notNull(),
  message: text('message').notNull(),
  success: boolean('success').default(true),
}, (table) => ({
  alertIdx: index('alert_triggers_alert_idx').on(table.alertId),
  triggeredAtIdx: index('alert_triggers_triggered_at_idx').on(table.triggeredAt),
}))

// User whale watchlists
export const watchlists = pgTable('watchlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  whaleAddress: text('whale_address').references(() => whales.address).notNull(),
  name: text('name'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('watchlists_user_idx').on(table.userId),
  whaleIdx: index('watchlists_whale_idx').on(table.whaleAddress),
}))

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertSubscriptionSchema = createInsertSchema(subscriptions)
export const selectSubscriptionSchema = createSelectSchema(subscriptions)
export const insertWhaleSchema = createInsertSchema(whales)
export const selectWhaleSchema = createSelectSchema(whales)
export const insertTransactionSchema = createInsertSchema(transactions)
export const selectTransactionSchema = createSelectSchema(transactions)
export const insertAlertSchema = createInsertSchema(alerts)
export const selectAlertSchema = createSelectSchema(alerts)

export type User = z.infer<typeof selectUserSchema>
export type Subscription = z.infer<typeof selectSubscriptionSchema>
export type Whale = z.infer<typeof selectWhaleSchema>
export type Transaction = z.infer<typeof selectTransactionSchema>
export type Alert = z.infer<typeof selectAlertSchema>
