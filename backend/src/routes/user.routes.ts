import express from 'express';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import { authHandler } from '../middleware/auth.middleware';
import createHttpError from 'http-errors';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

router.get('/me', authHandler, async (req, res) => {
  const [user] = await UserService.getUsers({
    ids: [req.userAuthPayload?.userId!],
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

router.post('/verify', async (req, res) => {
  const { otp, ...userData } = req.body;
  const newUser = await UserService.registerUser(userData, otp);
  res.status(201).json(newUser);
});

router.post('/register', async (req, res) => {
  await MailerService.sendOTP(req.body.email);
  res.status(201).send();
});

router.post('/updateProfile', async (req, res) => {
  await UserService.updateUser(req.body);
  res.sendStatus(200);
});

// Soft delete the authenticated user
router.delete('/me', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const result = await UserService.softDeleteUser(userId);

  if (!result) {
    // Since there is no function that really deletes a user in db, so this case probably not gonna happen
    return res
      .status(404)
      .json({ message: 'User not found or already removed' });
  }

  res.json({
    message: 'User soft deleted successfully',
  });
});

router.post('/me/reviews', authHandler, async (req, res) => {
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

// Get user by id (public)
router.get('/:id', async (req, res) => {
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
