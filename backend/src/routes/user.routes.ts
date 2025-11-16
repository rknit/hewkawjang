import express, { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import { authHandler } from '../middleware/auth.middleware';
import { ReservationQuerySchema } from '../validators/reservation.validator';
import ReservationService from '../service/reservation.service';
import multer from 'multer';
import SupabaseService from '../service/supabase.service';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: User not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
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

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Send OTP to email for user registration
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: OTP sent successfully to email
 *       400:
 *         description: Invalid email address
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', async (req: Request, res: Response) => {
  await MailerService.sendOTP(req.body.email);
  res.status(201).send();
});

/**
 * @openapi
 * /users/verify:
 *   post:
 *     summary: Register user with OTP verification
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyUserRequest'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP or registration data
 *       409:
 *         description: Email already exists
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/verify', async (req: Request, res: Response) => {
  const { otp, ...userData } = req.body;
  const newUser = await UserService.registerUser(userData, otp);
  res.status(201).json(newUser);
});

/**
 * @openapi
 * /users/me:
 *   delete:
 *     summary: Soft delete authenticated user account
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account successfully soft deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: User not found or already removed
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

  res.status(200).send();
});

/**
 * @openapi
 * /users/me/reviews:
 *   post:
 *     summary: Create a review for a completed reservation
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       201:
 *         description: Review successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateReviewResponse'
 *       400:
 *         description: Invalid review data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /users/me/reviews/{id}:
 *   delete:
 *     summary: Delete a review created by the authenticated user
 *     tags:
 *       - User
 *     parameters:
 *       - $ref: '#/components/parameters/reviewId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review successfully deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Review not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/me/reviews/:id', authHandler, async (req, res, next) => {
  //console.log('DELETE /me/reviews/:id called', req.params);
  try {
    const reviewId = Number(req.params.id);
    const userId = req.userAuthPayload?.userId;

    if (!userId) {
      throw createHttpError.Unauthorized('Missing user authentication');
    }

    await UserService.deleteReview(reviewId, userId);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /users/me/reservations:
 *   get:
 *     summary: Get reservations for the authenticated user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         description: Filter by reservation status (can specify multiple)
 *         schema:
 *           oneOf:
 *             - type: string
 *               enum: [unconfirmed, expired, confirmed, cancelled, rejected, completed, uncompleted]
 *             - type: array
 *               items:
 *                 type: string
 *                 enum: [unconfirmed, expired, confirmed, cancelled, rejected, completed, uncompleted]
 *       - name: offset
 *         in: query
 *         description: Number of reservations to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - name: limit
 *         in: query
 *         description: Maximum number of reservations to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Successfully retrieved user reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationWithRestaurant'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get public user profile by ID
 *     tags:
 *       - User
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /users/me/uploadProfileImage:
 *   post:
 *     summary: Upload profile image for authenticated user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file to upload
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadImageResponse'
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /users/updateProfile:
 *   post:
 *     summary: Update authenticated user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid profile data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

export default router;
