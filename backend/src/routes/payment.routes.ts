import express from 'express';

import paymentService from '../service/payment.service';
import { db } from '../db';
import { restaurantTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { env } from 'process';
import { authHandler } from '../middleware/auth.middleware';
const router = express.Router();

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

export default router;
