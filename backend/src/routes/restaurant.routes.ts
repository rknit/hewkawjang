import express from 'express';
import RestaurantService from '../service/restaurant.service';
import ReservationService from '../service/reservation.service';
import { authHandler } from '../middleware/auth.middleware';
import {
  createRestaurantSchema,
  updateRestaurantInfoSchema,
} from '../validators/restaurant.validator';

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

// Owner-facing: list reservations for a restaurant (owner only)
router.get('/:id/my-reservations', authHandler, async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant id' });
    }

    const userId = (req as any).userAuthPayload?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }

    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    let status: any = undefined;
    if (req.query.status) {
      const s = req.query.status;
      if (typeof s === 'string' && s.includes(',')) {
        status = s.split(',').map((x) => x.trim());
      } else {
        status = s as string;
      }
    }

    const reservations = await ReservationService.getReservationsByRestaurant({
      restaurantId,
      status,
      offset,
      limit,
    });

    return res.json(reservations);
  } catch (err) {
    next(err);
  }
});

// Public/user-facing: list reservations for a restaurant
router.get('/:id/reservations', async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'restaurant id must be a number' });
    }

    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    let status: any = undefined;
    if (req.query.status) {
      const s = req.query.status;
      if (typeof s === 'string' && s.includes(',')) {
        status = s.split(',').map((x) => x.trim());
      } else {
        status = s as string;
      }
    }

    const reservations = await ReservationService.getReservationsByRestaurant({
      restaurantId,
      status,
      offset,
      limit,
    });

    return res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.get('/reject', authHandler, async (req, res) => {
  await RestaurantService.rejectReservation(req.body.id);
  res.status(200).send();
});

router.get('/update/status', authHandler, async (req, res) => {
  await RestaurantService.updateRestaurantStatus(req.body.id, req.body.status);
  res.status(200).send();
});

router.put('/', authHandler, async (req, res) => {
  if (req.body) {
    req.body.ownerId = req.userAuthPayload!.userId; // from auth middleware
  }
  const info = updateRestaurantInfoSchema.parse(req.body);
  const updated = await RestaurantService.updateInfo(info);
  res.status(200).json(updated);
});

router.post('/', async (req, res, next) => {
  try {
    // validate request body
    const parsedData = createRestaurantSchema.parse(req.body);

    // call service
    const restaurant = await RestaurantService.createRestaurant(parsedData);

    res.status(201).json({
      message: 'Restaurant submitted successfully',
      restaurant,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({
        error: 'Bad request because some fields are missing or invalid.',
      });
    }
    next(err);
  }
});

router.post('/search', async (req, res, next) => {
  try {
    const {
      query,
      district,
      priceRange,
      cuisineTypes,
      minRating,
      sortBy,
      offset,
      limit,
    } = req.body;

    // Validate sortBy if provided
    if (sortBy && !['rating', 'price', 'name'].includes(sortBy.field)) {
      return res.status(400).json({
        error: 'Invalid sort field. Must be rating, price, or name',
      });
    }

    if (sortBy && !['asc', 'desc'].includes(sortBy.order)) {
      return res.status(400).json({
        error: 'Invalid sort order. Must be asc or desc',
      });
    }

    // Validate offset and limit if provided
    if (offset !== undefined && (isNaN(offset) || offset < 0)) {
      return res.status(400).json({
        error: 'Invalid offset. Must be a non-negative number',
      });
    }

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return res.status(400).json({
        error: 'Invalid limit. Must be a positive number',
      });
    }

    const searchParams = {
      query: query?.trim(),
      district: district?.trim(),
      priceRange: priceRange || { min: 0, max: 10000 },
      cuisineTypes: Array.isArray(cuisineTypes) ? cuisineTypes : [],
      minRating: minRating || 0,
      sortBy: sortBy || { field: 'rating', order: 'desc' },
      offset: offset || 0,
      limit: limit || 20,
    };

    const results = await RestaurantService.searchRestaurants(searchParams);

    res.json({
      restaurants: results.restaurants,
      total: results.total,
      hasMore: results.hasMore,
      searchParams,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/activation', authHandler, async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant id' });
    }

    const { status } = req.body as { status?: 'active' | 'inactive' };
    if (status !== 'active' && status !== 'inactive') {
      return res
        .status(400)
        .json({ error: "New status must be either 'active' or 'inactive'" });
    }

    const userId = (req as any).userAuthPayload?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // check ownership
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }

    if (restaurant.activation === status) {
      return res.status(200).json({
        message: `Restaurant is already ${status}`,
        restaurant,
      });
    }

    const updated = await RestaurantService.updateRestaurantActivation(
      restaurantId,
      status,
    );

    res.status(200).json({
      message:
        status === 'inactive'
          ? 'Restaurant deactivated successfully and all reservations cancelled'
          : 'Restaurant activated successfully',
      restaurant: updated,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authHandler, async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant id' });
    }
    const userId = (req as any).userAuthPayload?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // check ownership
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restaurant.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }

    await RestaurantService.deleteRestaurant(restaurantId);
    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
