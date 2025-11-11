import express from 'express';
import ReservationService from '../service/reservation.service';
import { authHandler } from '../middleware/auth.middleware';

const router = express.Router();

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

router.post('/create', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const { restaurantId, reserveAt, numberOfAdult, numberOfChildren } = req.body;

  if (!userId || !restaurantId || !reserveAt) {
    return res
      .status(400)
      .json({ error: 'userId, restaurantId and reserveAt are required' });
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
  });
    return res.status(201).json(reservation);
  } catch (error:any) {
    console.error('Reservation creation failed:', error);
    const message = error.message || 'Failed to create reservation';
    return res.status(500).json({ error: message });
  }
});

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

export default router;
