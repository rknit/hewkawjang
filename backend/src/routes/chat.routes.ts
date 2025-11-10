import express from 'express';
import { authHandler } from '../middleware/auth.middleware';
import ChatService from '../service/chat.service';
import MessageService from '../service/message.service';

const router = express.Router();

// Create or get chat with a restaurant
router.post('/:restaurantId', authHandler, async (req, res) => {
  const userId = req.userAuthPayload?.userId;
  const restaurantId = parseInt(req.params.restaurantId, 10);

  if (!userId || isNaN(restaurantId))
    return res.status(400).json({ message: 'Invalid user or restaurant ID' });

  const chat = await ChatService.findOrCreateChat(userId, restaurantId);
  res.status(200).json(chat);
});

// Get all messages for a chat
router.get('/:chatId/messages', authHandler, async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  if (isNaN(chatId))
    return res.status(400).json({ message: 'Invalid chat ID' });

  const messages = await MessageService.getMessages(chatId);
  res.status(200).json(messages);
});

// Send a new message
router.post('/:chatId/messages', authHandler, async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  const userId = req.userAuthPayload?.userId;
  const { content } = req.body;

  if (!content || typeof content !== 'string')
    return res.status(400).json({ message: 'Invalid content' });

  const message = await MessageService.sendMessage({
    chatId,
    senderUserId: userId,
    content,
  });

  res.status(201).json(message);
});

export default router;
