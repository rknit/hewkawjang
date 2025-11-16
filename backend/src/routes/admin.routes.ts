import express from 'express';
import createHttpError from 'http-errors';
import RestaurantService from '../service/restaurant.service';
import AdminService from '../service/admin.service';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import ReportService from '../service/report.service';

const router = express.Router();

/**
 * @openapi
 * /admins/me:
 *   get:
 *     summary: Get current admin profile
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin profile
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/Admin'
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       404:
 *         description: Admin not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authHandler, adminRoleHandler, async (req, res) => {
  const admin = await AdminService.getAdminById(req.userAuthPayload?.userId!);
  res.status(200).json(admin);
});

/**
 * @openapi
 * /admins/reports/pending:
 *   get:
 *     summary: Get pending reports for admin review
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending reports
 *         content:
 *           application/json:
 *            schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/reports/pending',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const reports = await ReportService.getPendingReports();
    res.status(200).json(reports);
  },
);

/**
 * @openapi
 * /admins/restaurants/pending-verification:
 *   get:
 *     summary: Get restaurants pending verification for admin review
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurants that are not verified
 *         content:
 *           application/json:
 *            schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/RestaurantUnverified'
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/restaurants/pending-verification',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const pendingRestaurants =
      await RestaurantService.getPendingVerificationRestaurants();
    res.status(200).json(pendingRestaurants);
  },
);

/**
 * @openapi
 * /admins/restaurants/{restaurantId}:
 *   delete:
 *     summary: Ban a restaurant by ID
 *     tags:
 *       - Admin
 *     parameters:
 *      - $ref: '#/components/parameters/restaurantId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Restaurant banned successfully
 *       400:
 *         description: Invalid restaurant ID provided
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       404:
 *        description: Restaurant not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /admins/reports/review:
 *   get:
 *     summary: Get reported reviews for admin review
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved reported reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportReview'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @openapi
 * /admins/reports/review/{reportId}/handle:
 *   post:
 *     summary: Handle a reported review (ban or reject)
 *     tags:
 *       - Admin
 *     parameters:
 *      - $ref: '#/components/parameters/reportId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Action to take on the reported review
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: boolean
 *                 description: true to ban the review, false to reject the report
 *     responses:
 *       204:
 *         description: Successfully handled the reported review
 *       400:
 *         description: Invalid query parameters/body
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/reports/review/:reportId/handle',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { reportId } = req.params;
    const { action } = req.body; // action is a boolean: true for ban, false for reject

    if (reportId === undefined) {
      throw createHttpError.BadRequest('Report ID must be provided');
    }

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
      res.status(204).send();
    } catch (error) {
      console.error('Error in /reports/review/:reportId/handle route:', error);
      throw createHttpError.InternalServerError(
        'Failed to handle the reported review',
      );
    }
  },
);

router.post(
  '/restaurants/:restaurantId/verify',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { restaurantId } = req.params;
    const { action } = req.body; // action: true for approve, false for reject

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
      await AdminService.updateRestaurantVerification(
        parseInt(restaurantId, 10),
        action,
      );
      res
        .status(200)
        .send('Restaurant verification status updated successfully');
    } catch (error) {
      console.error('Error in /reports/review/:reportId/handle route:', error);
      throw createHttpError.InternalServerError(
        'Failed to handle the reported review',
      );
    }
  },
);

router.post(
  '/reports/message/:reportId/handle',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { reportId } = req.params;
    const { action } = req.body; // action is a boolean: true for delete, false for reject

    if (action === undefined) {
      throw createHttpError.BadRequest('Action (true/false) must be provided');
    }

    if (typeof action !== 'boolean') {
      throw createHttpError.BadRequest(
        'Action must be a boolean value (true or false)',
      );
    }

    try {
      await AdminService.handleReportedMessage(parseInt(reportId, 10), action);
      res.status(200).send('Message report processed successfully');
    } catch (error) {
      console.error('Error in /reports/message/:reportId/handle route:', error);
      throw createHttpError.InternalServerError(
        'Failed to handle the reported message',
      );
    }
  },
);

router.get(
  '/reports/message',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { isSolved = 'false', page = '1', limit = '10' } = req.query;

    const isSolvedBool = isSolved === 'true';
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

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
      // You need to implement getReportedMessages in your AdminService
      const reportedMessages = await AdminService.getReportedMessages({
        isSolved: isSolvedBool,
        page: pageNum,
        limit: limitNum,
      });
      res.status(200).json(reportedMessages);
    } catch (error) {
      console.error('Error in /reports/message route:', error);
      throw createHttpError.InternalServerError(
        'Failed to fetch reported messages',
      );
    }
  },
);

export default router;
