import express from 'express';
import Stripe from 'stripe';

import paymentService from '../service/payment.service';
import { db } from '../db';
import { restaurantTable, usersTable, topupsTable } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { env } from 'process';
import { authHandler } from '../middleware/auth.middleware';

const stripe = require('stripe')(env.STRIPE_SK_API);
const router = express.Router();

router.post('/verify-session', authHandler, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userAuthPayload?.userId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify it's completed and for the correct user
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    if (session.metadata?.userId !== userId.toString()) {
      return res
        .status(403)
        .json({ error: 'Session does not belong to this user' });
    }

    const amount = Number(session.metadata?.amount);

    // Update user's balance if not already processed
    // If we've already recorded a recent topup for this user and amount, do not process again
    const existing = await db
      .select()
      .from(topupsTable)
      .where(
        and(
          eq(topupsTable.userId, userId),
          eq(topupsTable.amount, amount),
          sql`${topupsTable.createdAt} > (now() - interval '1 minutes')`,
        ),
      )
      .limit(1);

    if (existing && existing.length > 0) {
      // return current balance
      const userRecord = await db
        .select({ balance: usersTable.balance })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      return res.json({
        success: true,
        balance: userRecord[0]?.balance,
      });
    }

    const result = await db
      .update(usersTable)
      .set({
        balance: sql`${usersTable.balance} + ${amount}`,
      })
      .where(eq(usersTable.id, userId))
      .returning({ newBalance: usersTable.balance });

    // Insert topup record
    try {
      await db.insert(topupsTable).values({
        userId,
        amount,
      });
    } catch (err) {
      console.error('Failed to insert topup record:', err);
    }

    return res.json({
      success: true,
      balance: result[0]?.newBalance,
    });
  } catch (error) {
    console.error('Failed to verify session:', error);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

router.get('/balance', authHandler, async (req, res) => {
  try {
    const userId = req.userAuthPayload?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ balance: user[0].balance });
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.post('/create-checkout-session', authHandler, async (req, res) => {
  try {
    console.log('Create checkout session request:', {
      body: req.body,
      auth: req.userAuthPayload,
      headers: req.headers,
    });

    const { amount } = req.body;
    const userId = req.userAuthPayload?.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    // Create Stripe checkout session
    const session = await paymentService.createCheckoutSession({
      amount,
      userId,
    });

    return res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
    });
  }
});

router.post('/withdraw/:id', authHandler, async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);
    const { amount } = req.body; // Better name than "balance"

    // Validation
    if (!restaurantId || isNaN(restaurantId)) {
      return res.status(400).json({
        error: 'Invalid restaurant ID',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }

    // Get restaurant from DB
    const restaurant = await db
      .select()
      .from(restaurantTable)
      .where(eq(restaurantTable.id, restaurantId))
      .limit(1);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
      });
    }

    // Check sufficient balance
    if (restaurant[0].wallet < amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        available: restaurant[0].wallet,
        requested: amount,
      });
    }

    // Process withdrawal
    const transfer = await paymentService.createWithdraw({
      restaurantId,
      amount,
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);

    // Handle specific Stripe errors
  }
});

// Stripe webhook endpoint
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Processing successful payment:', {
            sessionId: session.id,
            metadata: session.metadata,
          });

          // Get user ID and amount from session metadata
          const userId = Number(session.metadata?.userId);
          const amount = Number(session.metadata?.amount);

          if (!userId || !amount) {
            console.error('Missing userId or amount in session metadata');
            return res.status(400).json({ error: 'Invalid metadata' });
          }

          // Verify user exists
          const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);

          if (!user || user.length === 0) {
            console.error(`User ${userId} not found`);
            return res.status(404).json({ error: 'User not found' });
          }

          // Update user's wallet balance
          const result = await db
            .update(usersTable)
            .set({
              balance: sql`${usersTable.balance} + ${amount}`,
            })
            .where(eq(usersTable.id, userId))
            .returning({ newBalance: usersTable.balance });

          console.log('Balance updated successfully:', {
            userId,
            amount,
            newBalance: result[0]?.newBalance,
          });

          // Record topup (idempotent: skip if exists)
          try {
            const existingTopup = await db
              .select()
              .from(topupsTable)
              .where(
                and(
                  eq(topupsTable.userId, userId),
                  eq(topupsTable.amount, amount),
                  sql`${topupsTable.createdAt} > (now() - interval '1 minutes')`,
                ),
              )
              .limit(1);

            if (!existingTopup || existingTopup.length === 0) {
              await db.insert(topupsTable).values({
                userId,
                amount,
              });
            }
          } catch (err) {
            console.error('Failed to record topup:', err);
          }

          break;
        }
        // Add other event types as needed
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(400).send('Webhook Error');
    }
  },
);

export default router;
