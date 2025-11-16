import express from 'express';
import { authHandler } from '../middleware/auth.middleware';
import ReservationService from '../service/reservation.service';
import RestaurantService from '../service/restaurant.service';
import {
  createRestaurantSchema,
  updateRestaurantInfoSchema,
} from '../validators/restaurant.validator';
import z from 'zod';
import createHttpError from 'http-errors';
import ReportService from '../service/report.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const querySchema = z.object({
    ids: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === '') return undefined;
        return val.split(',').map((id) => Number(id.trim()));
      }),
  });
  const { ids } = querySchema.parse(req.query);

  const restaurants = await RestaurantService.getRestaurants({
    ids,
  });
  res.json(restaurants);
});

router.get('/top-rated', async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
    return createHttpError.BadRequest('limit must be a positive number');
  }
  if (offset !== undefined && (isNaN(offset) || offset < 0)) {
    return createHttpError.BadRequest('offset must be a non-negative number');
  }

  const restaurants = await RestaurantService.getTopRatedRestaurants({
    limit,
    offset,
  });
  res.json(restaurants);
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

// Public: list all reviews for a restaurant
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'restaurant id must be a number' });
    }

    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await RestaurantService.getReviewsByRestaurantId({
      restaurantId,
      offset,
      limit,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/reject', authHandler, async (req, res) => {
  await RestaurantService.rejectReservation(req.body.id);
  res.status(200).send();
});

router.put('/update/status', authHandler, async (req, res) => {
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

router.post('/', authHandler, async (req, res, next) => {
  try {
    if (req.body) {
      req.body.ownerId = req.userAuthPayload!.userId; // from auth middleware
    }
    // validate request body
    const parsedData = createRestaurantSchema.parse(req.body);

    // call service
    const restaurant = await RestaurantService.createRestaurant(parsedData);

    res.status(201).json({
      message: 'Restaurant submitted successfully',
      id: restaurant.id,
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
      province,
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
      province: province?.trim(),
      priceRange: priceRange || { min: 0, max: 99999 },
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

// /restaurants/:id/reviews/filter?minRating=3&maxRating=5
router.get('/:id/reviews/filter', async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'restaurant id must be a number' });
    }

    const minRating = req.query.minRating
      ? Number(req.query.minRating)
      : undefined;
    const maxRating = req.query.maxRating
      ? Number(req.query.maxRating)
      : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const reviews = await RestaurantService.getFilteredReviews(
      restaurantId,
      minRating,
      maxRating,
    );

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/createDaysOff', authHandler, async (req, res, next) => {
  const userId = (req as any).userAuthPayload?.userId;
  try {
    const restaurant_id = parseInt(req.params.id);
    const { dates } = req.body; // ["2025-11-15", "2025-12-25"]
    const restaurant = await RestaurantService.getRestaurantById(restaurant_id);
    if (restaurant?.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }
    // Validate
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        error: 'dates array is required',
      });
    }

    // สร้างวันหยุด
    for (const e of dates) {
      await RestaurantService.createDaysOff(restaurant_id, e.toString());
    }
    res.status(201).json({
      message: 'Days off created successfully',
      restaurant_id,
      dates,
    });
  } catch (error) {
    next(error);
  }
});

// update days off with restaurant id and array of dates
router.put('/:id/updateDaysOff', authHandler, async (req, res, next) => {
  const userId = (req as any).userAuthPayload?.userId;
  try {
    const restaurant_id = parseInt(req.params.id);
    const { dates } = req.body; // ["2025-11-15", "2025-12-25"]
    const restaurant = await RestaurantService.getRestaurantById(restaurant_id);
    if (restaurant?.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }
    // Validate
    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({
        error: 'dates array is required',
      });
    }
    // update days off
    await RestaurantService.updateDaysOff(restaurant_id, dates);
    res.status(200).json({
      message: 'Days off updated successfully',
      restaurant_id,
      dates,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/daysOff', authHandler, async (req, res, next) => {
  const userId = (req as any).userAuthPayload?.userId;
  try {
    const restaurant_id = parseInt(req.params.id);
    const restaurant = await RestaurantService.getRestaurantById(restaurant_id);
    if (restaurant?.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: not owner' });
    }
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const daysOff = await RestaurantService.getDayOffByRestaurantId(
      restaurant_id,
      startDate,
      endDate,
    );

    res.json({ daysOff });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/report', authHandler, async (req, res) => {
  const restaurantId = Number(req.params.id);
  if (isNaN(restaurantId)) {
    return createHttpError.BadRequest('Invalid restaurant ID');
  }

  const reporterId = req.userAuthPayload?.userId!;

  await ReportService.reportRestaurant({
    reporterUserId: reporterId,
    targetRestaurantId: restaurantId,
  });

  res.sendStatus(201);
});

router.post('/reviews/:reviewId/report', authHandler, async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  if (isNaN(reviewId)) {
    return createHttpError.BadRequest('Invalid review ID');
  }

  const reporterId = req.userAuthPayload?.userId!;

  await ReportService.reportReview({
    reporterUserId: reporterId,
    targetReviewId: reviewId,
  });

  res.sendStatus(201);
});

router.get('/:id/hours', async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'restaurant id must be a number' });
    }
    const hours = await RestaurantService.getRestaurantHours(restaurantId);
    res.status(200).json(hours);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/hours', authHandler, async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'restaurant id must be a number' });
    }
    const hoursData = req.body; // Expecting an array of hours data
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
    const updatedHours = await RestaurantService.updateRestaurantHours(
      restaurantId,
      hoursData,
    );
    res.status(200).json(updatedHours);
  } catch (error) {
    next(error);
  }
});

export default router;
