import express, { Request, Response } from 'express';
import createHttpError from 'http-errors';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import { authHandler } from '../middleware/auth.middleware';
import { ReservationQuerySchema } from '../validators/reservation.validator';
import ReservationService from '../service/reservation.service';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     tags: [Users]
 *     description: Returns a list of all registered users.
 *     responses:
 *       200:
 *         description: A successful response with a list of users.
 */
router.get('/', async (req: Request, res: Response) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get currently authenticated user
 *     tags: [Users]
 *     description: Return the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A successful response with a user.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
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

router.get(
  '/me/reservations',
  authHandler,
  async (req: Request, res: Response, next) => {
    try {
      const userId = req.userAuthPayload?.userId;

      if (!userId) {
        throw new createHttpError.Unauthorized('User not authenticated');
      }

      // Validate and parse query params
      const parsedQuery = ReservationQuerySchema.parse(req.query);

      const reservations = await ReservationService.getReservationsByUser({
        userId,
        status: parsedQuery.status,
        offset: parsedQuery.offset,
        limit: parsedQuery.limit,
      });

      res.status(200).json(reservations);
    } catch (error) {
      next(error);
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
