import express from 'express';
import ReservationService from '../service/reservation.service';
import { authHandler } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /reservations/unconfirmed/inspect:
 *   get:
 *     summary: Get unconfirmed reservations for a restaurant
 *     tags:
 *       - Reservation
 *     parameters:
 *       - name: restaurantId
 *         in: query
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of reservations to skip
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved unconfirmed reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid restaurant ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/unconfirmed/inspect', async (req, res) => {
  const restaurantId = req.query.restaurantId
    ? Number(req.query.restaurantId)
    : NaN;
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'restaurantId must be a number' });
  }

  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  const reservations =
    await ReservationService.getUnconfirmedReservationsByRestaurant({
      restaurantId,
      offset,
    });

  return res.json(reservations);
});

/**
 * @openapi
 * /reservations/{id}/cancel:
 *   post:
 *     summary: Cancel a reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/reservationId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelReservationRequest'
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       400:
 *         description: Invalid reservation ID or cancelBy value
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/cancel', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload!.userId;
    const reservationId = Number(req.params.id);
    if (!reservationId) {
      return res.status(400).json({ error: 'reservationId is required' });
    }

    const { cancelBy } = req.body;
    if (!cancelBy || (cancelBy !== 'user' && cancelBy !== 'restaurant_owner')) {
      return res
        .status(400)
        .json({ error: 'cancelBy must be either user or restaurant_owner' });
    }

    await ReservationService.cancelReservation({
      reservationId,
      userId,
      cancelBy,
    });
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reservations/create:
 *   post:
 *     summary: Create a new reservation
 *     tags:
 *       - Reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid request data or reservation time must be at least 30 minutes in advance
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Failed to create reservation
 */
router.post('/create', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const {
    restaurantId,
    reserveAt,
    numberOfAdult,
    numberOfChildren,
    reservationFee,
  } = req.body;

  if (!userId || !restaurantId || !reserveAt || !reservationFee) {
    return res.status(400).json({
      error: 'userId, restaurantId, reservationFee and reserveAt are required',
    });
  }

  // Must be at least 30 minutes ahead
  const reserveTime = new Date(reserveAt);
  if (reserveTime.getTime() - Date.now() < 30 * 60 * 1000) {
    return res.status(400).json({
      error: 'Reservation must be made at least 30 minutes in advance',
    });
  }

  try {
    const reservation = await ReservationService.createReservation({
      userId,
      restaurantId,
      reserveAt: reserveTime,
      numberOfAdult,
      numberOfChildren,
      reservationFee,
    });
    return res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Reservation creation failed:', error);
    const message = error.message || 'Failed to create reservation';
    return res.status(500).json({ error: message });
  }
});

/**
 * @openapi
 * /reservations/{id}/inspect:
 *   get:
 *     summary: Get reservations for a restaurant in a specific month
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: month
 *         in: query
 *         required: true
 *         description: Month (1-12)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - name: year
 *         in: query
 *         required: true
 *         description: Year
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved reservations for the month
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid restaurant ID or month/year parameters
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/inspect', authHandler, async (req, res) => {
  const restaurantId = Number(req.params.id);
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'restaurant id must be a number' });
  }

  const month = Number(req.query.month);
  const year = Number(req.query.year);
  if (!year || !month || month < 1 || month > 12) {
    return res
      .status(400)
      .json({ error: 'year and month (1-12) are required' });
  }
  const reservations =
    await ReservationService.getReservationsByRestaurantIdInOneMonth(
      restaurantId,
      month,
      year,
    );
  return res.json(reservations);
});

/**
 * @openapi
 * /reservations/{id}/status:
 *   patch:
 *     summary: Update reservation status
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/reservationId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReservationStatusRequest'
 *     responses:
 *       200:
 *         description: Reservation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid reservation ID, status, or updateBy value
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/status', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload!.userId;
    const reservationId = Number(req.params.id);
    if (isNaN(reservationId)) {
      return res.status(400).json({ error: 'reservation id must be a number' });
    }

    const { status, updateBy } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'status is required' });
    }
    if (!updateBy || (updateBy !== 'user' && updateBy !== 'restaurant_owner')) {
      return res
        .status(400)
        .json({ error: 'updateBy must be either user or restaurant_owner' });
    }

    const allowed = [
      'unconfirmed',
      'expired',
      'confirmed',
      'cancelled',
      'rejected',
      'completed',
      'uncompleted',
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'invalid status value' });
    }

    const updated = await ReservationService.updateReservationStatus(
      reservationId,
      userId,
      status as
        | 'unconfirmed'
        | 'expired'
        | 'confirmed'
        | 'cancelled'
        | 'rejected'
        | 'completed'
        | 'uncompleted',
      updateBy,
    );
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reservations/{id}/confirm:
 *   post:
 *     summary: Confirm a reservation (restaurant owner action)
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/reservationId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid reservation ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/confirm', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload!.userId;
    const reservationId = Number(req.params.id);
    if (isNaN(reservationId)) {
      return res.status(400).json({ error: 'reservation id must be a number' });
    }

    const updated = await ReservationService.confirmReservation(
      reservationId,
      userId,
    );
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reservations/{id}/arrived:
 *   post:
 *     summary: Mark customer as arrived (restaurant owner action)
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/reservationId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer marked as arrived successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid reservation ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/arrived', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload!.userId;
    const reservationId = Number(req.params.id);
    if (isNaN(reservationId)) {
      return res.status(400).json({ error: 'reservation id must be a number' });
    }

    const updated = await ReservationService.markCustomerArrived(
      reservationId,
      userId,
    );
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reservations/{id}/no-show:
 *   post:
 *     summary: Mark customer as no-show (restaurant owner action)
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/reservationId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer marked as no-show successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid reservation ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/no-show', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload!.userId;
    const reservationId = Number(req.params.id);
    if (isNaN(reservationId)) {
      return res.status(400).json({ error: 'reservation id must be a number' });
    }

    const updated = await ReservationService.markCustomerNoShow(
      reservationId,
      userId,
    );
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
