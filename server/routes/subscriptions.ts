import { Router } from 'express'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '../index.js'
import { subscriptions, users } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { config } from '../config.js'

const router = Router()
const stripe = new Stripe(config.STRIPE_SECRET_KEY)

// Get user subscription
router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
    
    if (subscription.length === 0) {
      // Create free subscription
      const newSubscription = await db
        .insert(subscriptions)
        .values({
          userId,
          tier: 'free',
          status: 'active'
        })
        .returning()
      
      return res.json({
        success: true,
        data: newSubscription[0]
      })
    }
    
    res.json({
      success: true,
      data: subscription[0]
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    })
  }
})

// Create checkout session
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { tier, priceId } = req.body
    const userId = req.user?.id
    
    // Get or create Stripe customer
    let customer
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
    
    if (existingSubscription.length > 0 && existingSubscription[0].stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingSubscription[0].stripeCustomerId)
    } else {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      
      customer = await stripe.customers.create({
        email: user[0].email,
        metadata: { userId }
      })
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${config.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${config.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        tier
      }
    })
    
    res.json({
      success: true,
      data: { sessionId: session.id }
    })
  } catch (error) {
    console.error('Checkout error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    })
  }
})

// Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id
    
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
    
    if (subscription.length === 0 || !subscription[0].stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      })
    }
    
    // Cancel at period end
    await stripe.subscriptions.update(subscription[0].stripeSubscriptionId, {
      cancel_at_period_end: true
    })
    
    // Update database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId))
    
    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    })
  }
})

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig!, config.STRIPE_WEBHOOK_SECRET)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).send(`Webhook Error: ${error}`)
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, tier } = session.metadata!
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  await db
    .update(subscriptions)
    .set({
      tier: tier as any,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date()
    })
    .where(eq(subscriptions.userId, userId))
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    
    await db
      .update(subscriptions)
      .set({
        status: 'active',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await db
      .update(subscriptions)
      .set({
        status: 'past_due',
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date()
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
}

export { router as subscriptionRoutes }
