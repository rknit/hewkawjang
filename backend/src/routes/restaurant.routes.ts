import express from 'express';
import RestaurantService from '../service/restaurant.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await RestaurantService.getRestaurants(req.body);
  res.json(users);
});

router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = Number(req.params.ownerId);
    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (isNaN(ownerId)) {
      return res.status(400).json({ error: 'ownerId must be a number' });
    }

    const restaurants = await RestaurantService.getRestaurantsByOwner({
      ownerId,
      offset,
      limit,
    });

    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', details: (err as Error).message });
  }
});

export default router;
