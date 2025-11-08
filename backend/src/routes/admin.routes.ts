import express from 'express';
import createHttpError from 'http-errors';
import AdminService from '../service/admin.service';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import ReportService from '../service/report.service';

const router = express.Router();

router.get('/me', authHandler, adminRoleHandler, async (req, res) => {
  const admin = await AdminService.getAdminById(req.userAuthPayload?.userId!);
  res.status(200).json(admin);
});

router.get(
  '/reports/pending',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const reports = await ReportService.getPendingReports();
    res.status(200).json(reports);
  },
);

router.delete(
  '/restaurants/:restaurantId',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    if (isNaN(restaurantId)) {
      throw createHttpError.BadRequest('Invalid restaurant ID');
    }

    await AdminService.banRestaurant(restaurantId);
    res.status(204).send();
  },
);

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

router.get(
  '/reports/review',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { isSolved = 'false', page = '1', limit = '10' } = req.query;

    console.log('Received Query Params:', req.query); // Log incoming query parameters

    const isSolvedBool = isSolved === 'true'; // Convert 'isSolved' to boolean
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Validate 'page' and 'limit'
    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ error: 'Invalid page number. It must be a positive integer.' });
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({
        error: 'Invalid limit number. It must be a positive integer.',
      });
    }

    try {
      console.log('Calling AdminService.getReportedReviews...');
      const reportedReviews = await AdminService.getReportedReviews({
        isSolved: isSolvedBool,
        page: pageNum,
        limit: limitNum,
      });

      console.log('Reported Reviews:', reportedReviews); // Log the fetched reviews
      res.status(200).json(reportedReviews);
    } catch (error) {
      console.error('Error in /reports/review route:', error); // Log the error details
      throw createHttpError.InternalServerError(
        'Failed to fetch reported reviews',
      );
    }
  },
);

router.post(
  '/reports/review/:reportId/handle',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { reportId } = req.params;
    const { action } = req.body; // action is a boolean: true for ban, false for reject

    if (action === undefined) {
      throw createHttpError.BadRequest('Action (true/false) must be provided');
    }

    // Ensure the action is either true or false
    if (typeof action !== 'boolean') {
      throw createHttpError.BadRequest(
        'Action must be a boolean value (true or false)',
      );
    }

    try {
      await AdminService.handleReportedReview(parseInt(reportId, 10), action);
      res.status(200).send('Report processed successfully');
    } catch (error) {
      console.error('Error in /reports/review/:reportId/handle route:', error);
      throw createHttpError.InternalServerError(
        'Failed to handle the reported review',
      );
    }
  },
);

export default router;
