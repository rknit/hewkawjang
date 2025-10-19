import express, { Request, Response } from 'express';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import ReservationService from '../service/reservation.service';
import { authHandler } from '../middleware/auth.middleware';
import createHttpError from 'http-errors';

const router = express.Router();

// GET /users - Get all users (not recommended to expose publicly)
router.get('/', async (req: Request, res: Response) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

// GET /users/me - Get authenticated user profile
router.get('/me', authHandler, async (req: Request, res: Response) => {
  const userId = req.userAuthPayload?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const [user] = await UserService.getUsers({ ids: [userId] });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

// POST /users/register - Send OTP to email
router.post('/register', async (req: Request, res: Response) => {
  await MailerService.sendOTP(req.body.email);
  res.status(201).send();
});

// POST /users/verify - Register user with OTP
router.post('/verify', async (req: Request, res: Response) => {
  const { otp, ...userData } = req.body;
  const newUser = await UserService.registerUser(userData, otp);
  res.status(201).json(newUser);
});

// POST /users/updateProfile - Update user profile
router.post(
  '/updateProfile',
  authHandler,
  async (req: Request, res: Response) => {
    await UserService.updateUser(req.body);
    res.sendStatus(200);
  },
);

// DELETE /users/me - Soft delete authenticated user
router.delete('/me', authHandler, async (req: Request, res: Response) => {
  const userId = req.userAuthPayload?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const result = await UserService.softDeleteUser(userId);

  if (!result) {
    return res
      .status(404)
      .json({ message: 'User not found or already removed' });
  }

  res.json({ message: 'User soft deleted successfully' });
});

// POST /users/me/reviews - Add review as authenticated user
router.post('/me/reviews', authHandler, async (req: Request, res: Response) => {
  await UserService.createReview(req.body);
  res.status(201).send();
});

router.delete('/me/reviews/:id', authHandler, async (req, res, next) => {
  //console.log('DELETE /me/reviews/:id called', req.params);
  try {
    const reviewId = Number(req.params.id);
    const userId = req.userAuthPayload?.userId;

    if (!userId) {
      throw createHttpError.Unauthorized('Missing user authentication');
    }

    await UserService.deleteReview(reviewId, userId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /users/me/reservations - Get reservations for current user
import { z } from 'zod';
import { ZodError } from 'zod'; // ✅ make sure this is at the top

import UserReservationService from '../service/reservation.service';

// Define allowed reservation statuses
export const ReservationStatusEnum = z.enum([
  'unconfirmed',
  'expired',
  'confirmed',
  'cancelled',
  'rejected',
  'completed',
  'uncompleted',
]);

export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;

// Zod schema for query validation
const ReservationQuerySchema = z.object({
  status: z
    .union([ReservationStatusEnum, z.array(ReservationStatusEnum)])
    .optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get(
  '/me/reservations',
  authHandler,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userAuthPayload?.userId;

      if (!userId) {
        throw new createHttpError.Unauthorized('User not authenticated');
      }

      // Validate and parse query params
      const parsedQuery = ReservationQuerySchema.parse(req.query);

      const reservations = await UserReservationService.getReservationsByUser({
        userId,
        status: parsedQuery.status,
        offset: parsedQuery.offset,
        limit: parsedQuery.limit,
      });

      res.status(200).json(reservations);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid query parameters',
          issues: error.issues, // ✅ the correct property
        });
      }

      if (error instanceof createHttpError.HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

// POST /users/me/reservations/:id/cancel - Cancel a reservation
router.post(
  '/me/reservations/:id/cancel',
  authHandler,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userAuthPayload?.userId;

      if (!userId) {
        throw new createHttpError.Unauthorized('User not authenticated');
      }

      const reservationId = parseInt(req.params.id);
      if (isNaN(reservationId)) {
        throw new createHttpError.BadRequest('Invalid reservation ID');
      }

      await ReservationService.cancelReservation({
        reservationId,
        userId,
      });

      res.status(200).json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
      if (error instanceof createHttpError.HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
);

// GET /users/:id - Public user profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const user = await UserService.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

export default router;
