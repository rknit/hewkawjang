import { eq } from 'drizzle-orm';
import { db } from '../db';
import { reservationTable, restaurantTable, usersTable } from '../db/schema';
import createHttpError from 'http-errors';

export type RefundCase =
  | 'early_cancel' // Case 1: Customer cancels before confirmation or within 10 minutes
  | 'late_cancel_within_24h' // Case 2a: Customer cancels 10min-24h after confirmation
  | 'late_cancel_after_24h' // Case 2b: Customer cancels >24h after confirmation
  | 'no_show' // Case 3: Customer doesn't arrive within 15 minutes
  | 'arrived'; // Case 4: Customer arrives on time

interface RefundResult {
  case: RefundCase;
  customerRefund: number; // Amount refunded to customer (in same currency as reservation fee)
  restaurantPayout: number; // Amount paid to restaurant
  platformFee: number; // Amount kept by platform (5% of reservation fee)
}

export default class RefundService {
  /**
   * Calculate refund distribution based on the business rules
   * @param reservationId - The reservation ID
   * @param action - The action triggering the refund ('customer_cancel', 'no_show', 'arrived')
   * @returns RefundResult with distribution amounts
   */
  static async calculateRefund(
    reservationId: number,
    action: 'customer_cancel' | 'no_show' | 'arrived' | 'auto_expire',
  ): Promise<RefundResult> {
    // Fetch reservation details
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);

    if (!reservation) {
      throw new createHttpError.NotFound('Reservation not found');
    }

    const reservationFee = reservation.reservationFee || 0;
    const createdAt = new Date(reservation.createdAt);
    const confirmedAt = reservation.confirmedAt
      ? new Date(reservation.confirmedAt)
      : null;
    const reserveAt = new Date(reservation.reserveAt);
    const now = new Date();

    let refundCase: RefundCase | null = null;
    let customerRefund = 0;
    let restaurantPayout = 0;
    let platformFee = 0;

    if (action === 'auto_expire') {
      // auto expire case
      refundCase = 'early_cancel';
      customerRefund = reservationFee;
      restaurantPayout = 0;
      platformFee = 0;
    } else if (action === 'customer_cancel') {
      // customer cancel case
      const minutesSinceBooking =
        (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (!confirmedAt || minutesSinceBooking <= 10) {
        // Case 1: Customer cancels before confirmation or within 10 minutes of booking
        refundCase = 'early_cancel';
        customerRefund = reservationFee;
        restaurantPayout = 0;
        platformFee = 0;
      } else {
        const minutesUntilReservation =
          (reserveAt.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilReservation > 1440) {
          // Case 2a: More than 24 hours (1440 minutes) until reservation
          // Customer: 5% refund, Restaurant: 90%, Platform: 5%
          refundCase = 'late_cancel_within_24h';
          customerRefund = reservationFee * 0.05;
          restaurantPayout = reservationFee * 0.9;
          platformFee = reservationFee * 0.05;
        } else {
          // Case 2b: Less than 24 hours until reservation
          // Customer: 0% refund, Restaurant: 95%, Platform: 5%
          refundCase = 'late_cancel_after_24h';
          customerRefund = 0;
          restaurantPayout = reservationFee * 0.95;
          platformFee = reservationFee * 0.05;
        }
      }
    } else if (action === 'no_show') {
      // Case 3: Customer doesn't arrive within 15 minutes of reservation time
      // Restaurant: 95%, Platform: 5%, Customer: 0%
      refundCase = 'no_show';
      customerRefund = 0;
      restaurantPayout = reservationFee * 0.95;
      platformFee = reservationFee * 0.05;
    } else if (action === 'arrived') {
      // Case 4: Customer arrives on time
      // Customer: 95% refund, Restaurant: 0%, Platform: 5%
      refundCase = 'arrived';
      customerRefund = reservationFee * 0.95;
      restaurantPayout = 0;
      platformFee = reservationFee * 0.05;
    } else {
      throw new createHttpError.InternalServerError('Invalid refund action');
    }

    if (!refundCase) {
      throw new createHttpError.InternalServerError('Invalid refund action');
    }

    return {
      case: refundCase,
      customerRefund: Math.round(customerRefund * 100) / 100, // Round to 2 decimal places
      restaurantPayout: Math.round(restaurantPayout * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
    };
  }

  /**
   * Process refund and update balances
   * @param reservationId - The reservation ID
   * @param action - The action triggering the refund
   * @returns RefundResult with distribution amounts
   */
  static async processRefund(
    reservationId: number,
    action: 'customer_cancel' | 'no_show' | 'arrived' | 'auto_expire',
  ): Promise<RefundResult> {
    // Calculate refund distribution
    const refundResult = await this.calculateRefund(reservationId, action);

    // Fetch reservation to get user and restaurant IDs
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);

    if (!reservation) {
      throw new createHttpError.NotFound('Reservation not found');
    }

    // Update user balance if customer gets a refund
    if (refundResult.customerRefund > 0) {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, reservation.userId))
        .limit(1);

      if (user) {
        await db
          .update(usersTable)
          .set({ balance: user.balance + refundResult.customerRefund })
          .where(eq(usersTable.id, reservation.userId));
      }
    }

    // Update restaurant wallet if restaurant gets a payout
    if (refundResult.restaurantPayout > 0) {
      const [restaurant] = await db
        .select()
        .from(restaurantTable)
        .where(eq(restaurantTable.id, reservation.restaurantId))
        .limit(1);

      if (restaurant) {
        await db
          .update(restaurantTable)
          .set({ wallet: restaurant.wallet + refundResult.restaurantPayout })
          .where(eq(restaurantTable.id, reservation.restaurantId));
      }
    }

    // Platform fee is implicitly kept (not refunded to anyone)
    // You could track this in a separate platform_earnings table if needed

    return refundResult;
  }

  /**
   * Check if customer can still cancel for full refund (within 10 minutes of booking)
   * @param reservationId - The reservation ID
   * @returns boolean - true if within 10-minute window
   */
  static async canCancelForFullRefund(reservationId: number): Promise<boolean> {
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);

    if (!reservation) {
      return false;
    }

    const createdAt = new Date(reservation.createdAt);
    const now = new Date();
    const minutesSinceBooking =
      (now.getTime() - createdAt.getTime()) / (1000 * 60);

    return minutesSinceBooking <= 10 && !reservation.confirmedAt;
  }

  /**
   * Check if it's past the arrival time window (15 minutes after reservation time)
   * @param reservationId - The reservation ID
   * @returns boolean - true if past the arrival window
   */
  static async isPastArrivalWindow(reservationId: number): Promise<boolean> {
    const [reservation] = await db
      .select()
      .from(reservationTable)
      .where(eq(reservationTable.id, reservationId))
      .limit(1);

    if (!reservation) {
      return false;
    }

    const reserveAt = new Date(reservation.reserveAt);
    const now = new Date();
    const minutesSinceReservation =
      (now.getTime() - reserveAt.getTime()) / (1000 * 60);

    return minutesSinceReservation > 15;
  }
}
