import express from 'express';
import ReservationService from '../service/reservation.service';
import { authHandler } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/unconfirmed/inspect', async (req, res) => {
  const restaurantId = req.query.restaurantId ? Number(req.query.restaurantId) : NaN;
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'restaurantId must be a number' });
  }

  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  const reservations = await ReservationService.getUnconfirmedReservationsByRestaurant({
    restaurantId,
    offset,
  });

  return res.json(reservations);
});

router.post('/cancel',authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const { reservationId, restaurantId } = req.body;  
  if (!reservationId || !userId || !restaurantId) {
    return res.status(400).json({ error: 'reservationId, userId and restarantId are required' });
  }
  try {
    await ReservationService.cancelReservation({ reservationId, userId, restaurantId });
    return res.json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }         
});

export default router;
