import express from 'express';
import UserService from '../service/user.service';
import AuthService from '../service/auth.service';

const router = express.Router();

// Login and get tokens
router.post('/login', async (req, res) => {
  const token = await AuthService.loginUser(req.body);
  res.status(200).json(token);
});

// Token refresh
router.post('/refresh', async (req, res) => {});

export default router;
