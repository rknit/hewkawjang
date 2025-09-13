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

router.post('/cancel', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const { reservationId, restaurantId } = req.body;
  if (!reservationId || !userId || !restaurantId) {
    return res
      .status(400)
      .json({ error: 'reservationId, userId and restarantId are required' });
  }

  await ReservationService.cancelReservation({
    reservationId,
    userId,
    restaurantId,
  });
  return res.sendStatus(200);
});

export default router;


router.post('/create', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload?.userId;
    const { restaurantId, reserveAt,
            numberOfAdult, numberOfChildren } = req.body;

    if (!userId || !restaurantId || !reserveAt) {
      return res.status(400).json({ error: 'userId, restaurantId and reserveAt are required' });
    }

    // Must be at least 30 minutes ahead
    const reserveTime = new Date(reserveAt);
    if (reserveTime.getTime() - Date.now() < 30 * 60 * 1000) {
      return res
        .status(400)
        .json({ error: 'Reservation must be made at least 30 minutes in advance' });
    }

    const reservation = await ReservationService.createReservation({
      userId,
      restaurantId,
      reserveAt: reserveTime,
      numberOfAdult,
      numberOfChildren,
 
    });

    return res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});
