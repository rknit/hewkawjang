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

/**
 * @openapi
 * /restaurants/:
 *   get:
 *     summary: Get restaurants by IDs (optional filter)
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - name: ids
 *         in: query
 *         description: Comma-separated list of restaurant IDs to fetch
 *         schema:
 *           type: string
 *           example: '1,2,3'
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/top-rated:
 *   get:
 *     summary: Get top-rated restaurants
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of restaurants to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: offset
 *         in: query
 *         description: Number of restaurants to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved top-rated restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid limit or offset parameter
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/owner/{ownerId}:
 *   get:
 *     summary: Get restaurants by owner ID
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - name: ownerId
 *         in: path
 *         required: true
 *         description: ID of the restaurant owner
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved owner's restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid owner ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/my-reservations:
 *   get:
 *     summary: Get reservations for owner's restaurant (owner only)
 *     description: Allows restaurant owners to view all reservations for their restaurant with filtering options
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: status
 *         in: query
 *         description: Filter by reservation status (can be comma-separated)
 *         schema:
 *           type: string
 *           example: 'confirmed,completed'
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       404:
 *         description: Restaurant not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/reservations:
 *   get:
 *     summary: Get public reservations for a restaurant
 *     description: Public endpoint to view reservations for a restaurant
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: status
 *         in: query
 *         description: Filter by reservation status (can be comma-separated)
 *         schema:
 *           type: string
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid restaurant ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a restaurant
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurant reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid restaurant ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/update/status:
 *   put:
 *     summary: Update restaurant status (open/closed)
 *     tags:
 *       - Restaurant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantStatusRequest'
 *     responses:
 *       200:
 *         description: Restaurant status updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/update/status', authHandler, async (req, res) => {
  await RestaurantService.updateRestaurantStatus(req.body.id, req.body.status);
  res.status(200).send();
});

/**
 * @openapi
 * /restaurants/:
 *   put:
 *     summary: Update restaurant information (owner only)
 *     tags:
 *       - Restaurant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRestaurantRequest'
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/', authHandler, async (req, res) => {
  if (req.body) {
    req.body.ownerId = req.userAuthPayload!.userId; // from auth middleware
  }
  const info = updateRestaurantInfoSchema.parse(req.body);
  const updated = await RestaurantService.updateInfo(info);
  res.status(200).json(updated);
});

/**
 * @openapi
 * /restaurants/:
 *   post:
 *     summary: Create a new restaurant (owner only)
 *     description: Submit a new restaurant for creation. Owner ID is automatically set from authentication.
 *     tags:
 *       - Restaurant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRestaurantRequest'
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateRestaurantResponse'
 *       400:
 *         description: Invalid request data or missing required fields
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/search:
 *   post:
 *     summary: Advanced restaurant search with filters
 *     description: Search for restaurants with multiple filter criteria including query text, province, price range, cuisine types, minimum rating, and sorting options
 *     tags:
 *       - Restaurant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantSearchRequest'
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantSearchResponse'
 *       400:
 *         description: Invalid search parameters (e.g., invalid sort field or order, invalid offset/limit)
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/activation:
 *   patch:
 *     summary: Activate or deactivate a restaurant (owner only)
 *     description: Change restaurant activation status. Deactivating will automatically cancel all active reservations.
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantActivationRequest'
 *     responses:
 *       200:
 *         description: Restaurant activation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantActivationResponse'
 *       400:
 *         description: Invalid restaurant ID or status value
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       404:
 *         description: Restaurant not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant (owner only)
 *     description: Soft delete a restaurant. Only the owner can delete their restaurant.
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Restaurant deleted successfully'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       404:
 *         description: Restaurant not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/reviews/filter:
 *   get:
 *     summary: Get filtered reviews for a restaurant by rating range
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: minRating
 *         in: query
 *         description: Minimum rating filter
 *         schema:
 *           type: number
 *           format: double
 *           minimum: 0
 *           maximum: 5
 *       - name: maxRating
 *         in: query
 *         description: Maximum rating filter
 *         schema:
 *           type: number
 *           format: double
 *           minimum: 0
 *           maximum: 5
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid restaurant ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/createDaysOff:
 *   post:
 *     summary: Create days off for a restaurant (owner only)
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DaysOffRequest'
 *     responses:
 *       201:
 *         description: Days off created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DaysOffResponse'
 *       400:
 *         description: Missing or invalid dates array
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/updateDaysOff:
 *   put:
 *     summary: Update days off for a restaurant (owner only)
 *     description: Replace existing days off with a new list of dates
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DaysOffRequest'
 *     responses:
 *       200:
 *         description: Days off updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DaysOffResponse'
 *       400:
 *         description: Missing or invalid dates array
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/daysOff:
 *   get:
 *     summary: Get days off for a restaurant (owner only)
 *     description: Retrieve list of days off for a restaurant within an optional date range
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved days off
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DaysOffData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/report:
 *   post:
 *     summary: Report a restaurant
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Restaurant reported successfully
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/reviews/{reviewId}/report:
 *   post:
 *     summary: Report a review
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: ID of the review to report
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review reported successfully
 *       400:
 *         description: Invalid review ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/hours:
 *   get:
 *     summary: Get operating hours for a restaurant
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurant hours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantHours'
 *       400:
 *         description: Invalid restaurant ID
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /restaurants/{id}/hours:
 *   put:
 *     summary: Update operating hours for a restaurant (owner only)
 *     tags:
 *       - Restaurant
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/RestaurantHours'
 *     responses:
 *       200:
 *         description: Restaurant hours updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantHours'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not the owner of this restaurant
 *       404:
 *         description: Restaurant not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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
