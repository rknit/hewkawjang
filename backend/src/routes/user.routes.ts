import express from 'express';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

router.post('/verify', async (req, res) => {
  const { otp, ...userData } = req.body;
  const newUser = await UserService.registerUser(userData, otp);
  res.status(201).json(newUser);
});

router.post('/register', async (req, res) => {
  const verifyEmail = await MailerService.sendOTP(req.body.email);
  res.status(201).json(verifyEmail);
});

export default router;
