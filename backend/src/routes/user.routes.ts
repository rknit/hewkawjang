import express from 'express';
import UserService from '../service/user.service';
import MailerService from '../service/mailer.service';
import { verify } from 'crypto';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await UserService.getUsers(req.body);
  res.json(users);
});

router.post('/', async (req, res) => {
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(newUser);
});

router.post('/register', async (req, res) => {
  const newUser = await UserService.registerUser(req.body);
  res.status(201).json(newUser);
});

router.post('/verify', async (req, res) => {
  const verifyEmail = await MailerService.sendOTP(req.body.email);
  res.status(201).json(verifyEmail);
});

router.post("/login", async (req, res) => {
  const loginUser = await UserService.loginUser(req.body);
  res.status(201).json(loginUser);  
});

export default router;
