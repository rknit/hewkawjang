import { restaurantTable, withdrawsTable } from '../db/schema';
import { db } from '../db';

import { eq, sql } from 'drizzle-orm';
import { env } from 'process';
import Stripe from 'stripe';

const stripe = require('stripe')(env.STRIPE_SK_API);

export default class paymentService {
  static async createWithdraw(props: {
    restaurantId: number;
    amount: number;
  }): Promise<Stripe.Transfer> {
    // Verify the account and capability status

    const transfer = await stripe.transfers.create({
      amount: Math.round(props.amount * 100), // integer in cents
      currency: 'usd',
      destination: 'acct_1SOuRfFuqLMdf7SR', // Connected account ID
      description: `Withdrawal for restaurant #${props.restaurantId}`,
      metadata: {
        restaurantId: props.restaurantId.toString(),
        amount: props.amount.toString(),
        type: 'withdrawal',
      },
    });
    await db
      .insert(withdrawsTable)
      .values({ restaurantId: props.restaurantId, balance: props.amount });

    await db
      .update(restaurantTable)
      .set({
        wallet: sql<number>`${restaurantTable.wallet} - ${props.amount}`,
      })
      .where(eq(restaurantTable.id, props.restaurantId));

    return transfer;
  }
  static async updateWithdraw(props: {
    restaurantId: number;
    balance: number;
  }) {
    await db
      .update(withdrawsTable)
      .set({ balance: props.balance })
      .where(eq(withdrawsTable.restaurantId, props.restaurantId));
  }

  static async deleteWithdraw(props: { id: number }) {
    await db.delete(withdrawsTable).where(eq(withdrawsTable.id, props.id));
  }

  static async createCheckoutSession(props: {
    amount: number;
    userId: number;
  }): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'Wallet Top-up',
            },
            unit_amount: Math.round(props.amount * 100), // convert to smallest currency unit (satang)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: props.userId.toString(),
        amount: props.amount.toString(),
        type: 'topup',
      },
    });

    return session;
  }
}
