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

router.post('/cancel/:id', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const reservationId = Number(req.params.id);
  if (!reservationId || !userId) {
    return res.status(400).json({ error: 'reservationId is required' });
  }

  await ReservationService.cancelReservation({
    reservationId,
    userId,
  });
  return res.sendStatus(200);
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

  const reservation = await ReservationService.createReservation({
    userId,
    restaurantId,
    reserveAt: reserveTime,
    numberOfAdult,
    numberOfChildren,
  });

  return res.status(201).json(reservation);
});

router.get('/:id/reservations/inspect', async (req, res) => {
  const restaurantId = Number(req.params.id);
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'restaurant id must be a number' });
  }

  const year = req.body.year;
  const month = req.body.month;
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

export default router;
