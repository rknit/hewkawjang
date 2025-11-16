import express from 'express';
import NotificationService from '../service/notification.service';
import { authHandler } from '../middleware/auth.middleware';
import { notificationTypesEnum } from '../db/schema';
import { notificationInsertSchema } from '../validators/notification.validator';

const router = express.Router();

type CreateNotificationBody = {
  userId: number;
  notificationType: (typeof notificationTypesEnum.enumValues)[number];
  message?: string;
  imageUrl?: string;
  reservationId?: number;
};

/**
 * @openapi
 * /notifications/:
 *   get:
 *     summary: Get notifications for authenticated user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of notifications to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *       - name: offset
 *         in: query
 *         description: Number of notifications to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;

  if (typeof userId !== 'number') {
    return res.status(401).json({ message: 'Invalid authentication payload' });
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const offset = req.query.offset
    ? parseInt(req.query.offset as string, 10)
    : 0;

  const notifications = await NotificationService.getNotificationsByUser({
    userId,
    limit,
    offset,
  });

  res.status(200).json(notifications);
});

/**
 * @openapi
 * /notifications/:
 *   post:
 *     summary: Create a notification
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid request data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authHandler, async (req, res) => {
  const validationResult = notificationInsertSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid request data',
      errors: validationResult.error.format(),
    });
  }

  const newNotification = await NotificationService.createNotifications([
    validationResult.data,
  ]);

  res.status(201).json(newNotification);
});

/**
 * @openapi
 * /notifications/unread/count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved unread count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/unread/count', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  if (typeof userId !== 'number') {
    return res.status(401).json({ message: 'Invalid authentication payload' });
  }

  const result = await NotificationService.getUnreadCount({ userId });

  res.status(200).json(result);
});

/**
 * @openapi
 * /notifications/mark-all-as-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All notifications marked as read successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/mark-all-as-read', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;

  if (typeof userId !== 'number') {
    return res.status(401).json({ message: 'Invalid authentication payload' });
  }

  await NotificationService.markAllAsRead({ userId });

  res.status(204).send();
});

/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notification
 *     parameters:
 *       - $ref: '#/components/parameters/notificationId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Notification marked as read successfully
 *       400:
 *         description: Invalid notification ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:notificationId/read', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;

  if (typeof userId !== 'number') {
    return res.status(401).json({ message: 'Invalid authentication payload' });
  }

  const notificationId = parseInt(req.params.notificationId, 10);

  if (isNaN(notificationId)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  await NotificationService.markAsRead({ userId, notificationId });

  res.status(204).send();
});

/**
 * @openapi
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notification
 *     parameters:
 *       - $ref: '#/components/parameters/notificationId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 *       400:
 *         description: Invalid notification ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:notificationId', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;

  if (typeof userId !== 'number') {
    return res.status(401).json({ message: 'Invalid authentication payload' });
  }

  const notificationId = parseInt(req.params.notificationId, 10);

  if (isNaN(notificationId)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  await NotificationService.deleteNotification({ userId, notificationId });

  res.status(204).send();
});

export default router;
