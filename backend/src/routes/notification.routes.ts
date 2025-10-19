import express from 'express';
import NotificationService from '../service/notification.service';
import { authHandler } from '../middleware/auth.middleware';
import { notificationTypesEnum } from '../db/schema';
import { notificationInsertSchema } from '../validators/notification.validator';

const router = express.Router();

type CreateNotificationBody = {
  userId: number;
  notificationType: typeof notificationTypesEnum.enumValues[number];
  message?: string;
  imageUrl?: string;
  reservationId?: number;
};

router.get('/', authHandler , async (req, res) => {
    const userId = req.userAuthPayload?.userId;
    
    if (typeof userId !== 'number') {
      return res.status(401).json({ message: 'Invalid authentication payload' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    const notifications = await NotificationService.getNotificationsByUser({
      userId,
      limit,
      offset,
    });
    
    res.status(200).json(notifications);
});

router.post('/', authHandler, async (req, res) => {
    
    const validationResult = notificationInsertSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ 
            message: 'Invalid request data',
            errors: validationResult.error.format(),
        });
    }

    const newNotification = await NotificationService.createNotifications(
      [validationResult.data]
    );
    
    res.status(201).json(newNotification);
});

router.get('/unread/count',authHandler,async (req, res) => {
    const userId = req.userAuthPayload?.userId;
    if (typeof userId !== 'number') {
      return res.status(401).json({ message: 'Invalid authentication payload' });
    }
    
    const result = await NotificationService.getUnreadCount({ userId });
    
    res.status(200).json(result);
});

router.post('/mark-all-as-read',authHandler, async (req, res) => {
    const userId = req.userAuthPayload?.userId;

    if (typeof userId !== 'number') {
      return res.status(401).json({ message: 'Invalid authentication payload' });
    }

    await NotificationService.markAllAsRead({ userId });
    
    res.status(204).send();
});

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
