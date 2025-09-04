import express from 'express';
import UserService from '../service/user.service';

const router = express.Router();

router.get('/', async (_, res) => {
  const users = await UserService.getUsers();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { firstName, lastName } = req.body;
  const newUsers = await UserService.createUsers([{ firstName, lastName }]);
  res.status(201).json(newUsers);
});

export default router;
