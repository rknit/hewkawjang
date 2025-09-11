import express from 'express';
import UserService from '../service/user.service';
import { authHandler } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

// register a new user
router.post('/register', async (req, res) => {
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(newUser);
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
    return res.status(404).json({ message: 'User not found or already removed' });
  }

  res.json({ 
    message: 'User soft deleted successfully' 
  });
});

export default router;
