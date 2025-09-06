import express from 'express';
import UserService from '../service/user.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

router.post('/', async (req, res) => {
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(newUser);
});

router.delete('/me', async (req, res) => {
  try {
    const { userId } = req.body; // Since I don't know how the authentication process works, I just assume the user id is in req.body
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    await UserService.softDeleteUser(userId);
      
    res.status(200).json({ 
      message: 'User soft deleted successfully' 
    });
  } catch (err) {
    console.error('Error in DELETE /me:', err);
    res.status(500).json({ message: 'Could not soft delete user' });
  } 
});

export default router;
