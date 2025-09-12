import express from 'express';
import RestaurantService from '../service/restaurant.service';
import { authHandler } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await RestaurantService.getRestaurants(req.body);
  res.json(users);
});

router.get('/owner/:ownerId', async (req, res) => {
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
});

router.get('/reject',authHandler ,async (req, res) => {
  const users = await RestaurantService.rejectReservation(req.body.id);
  res.status(201).json(users);
});

router.get('/update/status',authHandler ,async (req, res) => {
  const users = await RestaurantService.updateRestaurantStatus(req.body.id, req.body.status);
  res.status(201).json(users);
});

export default router;
