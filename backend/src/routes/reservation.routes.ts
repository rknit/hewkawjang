import express from 'express';
import ReservationService from '../service/reservation.service';

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

export default router;
