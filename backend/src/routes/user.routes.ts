import express from 'express';
import UserService from '../service/user.service';

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

export default router;
