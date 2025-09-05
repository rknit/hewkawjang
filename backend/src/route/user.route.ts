import express from 'express';
import UserService from '../service/user.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const props: {
    id?: number;
    offset?: number;
    limit?: number;
  } = req.body;
  const users = await UserService.getUser(props);
  res.json(users);
});

router.post('/', async (req, res) => {
  const data: {
    firstName: string;
    lastName: string;
    email: string;
  } = req.body;
  const newUser = await UserService.createUser(data);
  res.status(201).json(newUser);
});

export default router;
