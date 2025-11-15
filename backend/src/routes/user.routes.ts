import express, { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import { authHandler } from '../middleware/auth.middleware';
import { ReservationQuerySchema } from '../validators/reservation.validator';
import ReservationService from '../service/reservation.service';
import multer from 'multer';
import SupabaseService from '../service/supabase.service';
import { db } from '../db';
import { reservationTable, reviewTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
router.post(
  '/me/reviews',
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewData = req.body;

      // Create the review and return the review ID
      const reviewId = await UserService.createReview(reviewData);

      // Return the reviewId in the response
      res.status(201).json({ reviewId });
    } catch (error) {
      next(error); // Pass error to the error handler middleware
    }
  },
);

router.delete('/me/reviews/:id', authHandler, async (req, res, next) => {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.userAuthPayload?.userId;

    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // DEBUG
    console.log('[DELETE /me/reviews/:id]', { reviewId, userId });

    await UserService.deleteReview(reviewId, userId);
    return res.sendStatus(204);
  } catch (error) {
    // DEBUG
    console.error('[DELETE /me/reviews/:id] error:', error);
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

router.post(
  '/me/uploadProfileImage',
  authHandler,
  upload.single('file'), // <-- must match frontend
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file);
    try {
      const userId = req.userAuthPayload?.userId;
      const file = req.file;
      if (!userId || !file)
        return res.status(400).json({ message: 'No file uploaded' });

      const imageUrl = await SupabaseService.uploadUserProfileImage(
        String(userId),
        file,
      );
      await UserService.updateUser({ id: userId, profileUrl: imageUrl } as any);

      res.json({ imageUrl });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/updateProfile', authHandler, async (req, res, next) => {
  try {
    const userId = req.userAuthPayload?.userId;
    const { displayName, firstName, lastName, phoneNo, email } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updatedUser = await UserService.updateUser({
      id: userId,
      displayName,
      firstName,
      lastName,
      phoneNo,
      email,
    } as any);

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// GET /users/me/reviews?restaurantId=123 → [your review ids at this restaurant]
router.get(
  '/me/reviews',
  authHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userAuthPayload?.userId;
      const restaurantId = Number(req.query.restaurantId);

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      if (!restaurantId || Number.isNaN(restaurantId)) {
        return res.status(400).json({ message: 'Invalid restaurantId' });
      }

      const rows = await db
        .select({ reviewId: reviewTable.id })
        .from(reviewTable)
        .innerJoin(
          reservationTable,
          eq(reviewTable.reservationId, reservationTable.id),
        )
        .where(
          and(
            eq(reservationTable.userId, userId),
            eq(reservationTable.restaurantId, restaurantId),
            // If you have reviewTable.isDeleted, uncomment the next line:
            // eq(reviewTable.isDeleted, false),
          ),
        );

      const reviewIds = rows.map((r) => r.reviewId);
      return res.json({ reviewIds });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
