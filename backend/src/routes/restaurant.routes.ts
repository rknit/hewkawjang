import express from 'express';
import RestaurantService from '../service/restaurant.service';
import { createRestaurantSchema } from "../validators/restaurant.validator";

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

router.post("/", async (req, res, next) => {
//  try {
    // validate request body
    const parsedData = createRestaurantSchema.parse(req.body);

    // call service
    const restaurant = await RestaurantService.createRestaurant(parsedData);

    res.status(201).json({
      message: "Restaurant submitted successfully",
      restaurant,
    });
//   } catch (err) {
//     if (err instanceof Error) {
//       return res.status(400).json({ error: err.message });
//     }
//    next(err);
//  }
});

export default router;
