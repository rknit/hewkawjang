import express from 'express';
import createHttpError from 'http-errors';
import AdminService from '../service/admin.service';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', authHandler, adminRoleHandler, async (req, res) => {
  const admin = await AdminService.getAdminById(req.userAuthPayload?.userId!);
  res.status(200).json(admin);
});

// Create admin bypass (development only)
// Allows creating an admin account without existing credentials
router.post('/admin-bypass', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    throw createHttpError.Forbidden('Admin login is disabled in production');
  }

  const { email, password } = req.body;
  if (!email || !password) {
    throw createHttpError.BadRequest('Email and password are required');
  }

  await AdminService.createAdminBypass({ email, password });
  res.status(201);
});

export default router;
