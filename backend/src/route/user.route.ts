import express from 'express';
import UserService from '../service/user.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const props = req.body;
  const users = await UserService.getUsers(props);
  res.json(users);
});

router.post('/', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const newUsers = await UserService.createUsers([
    {
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
    },
  ]);
  res.status(201).json(newUsers);
});

export default router;
