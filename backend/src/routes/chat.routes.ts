import express from 'express';
import ChatService from '../service/chat.service';
import MessageService from '../service/message.service'; // you'll add this soon
import { db } from '../db';
import { chatsTable, usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * @route GET /chat/user/:userId
 * @desc Get all chat channels for a specific user (for restaurant side)
 */
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await ChatService.getChatsByUser(Number(userId));
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user chats', error: err });
  }
});

/**
 * @route GET /chat/restaurant/:restaurantId
 * @desc Get all chat channels for a specific restaurant (for admin side)
 */
/**
 * @route GET /chat/all/:userId
 * @desc Get all chats where user is either a customer or restaurant owner
 */
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await ChatService.getChatsForUserOrOwner(Number(userId));
    res.json(chats);
  } catch (err: any) {
    console.error('Error fetching combined chats:', err);
    const detail = err?.cause?.detail ?? err?.message;
    res.status(500).json({
      message: 'Failed to fetch all chats',
      error: detail ?? String(err),
    });
  }
});

/**
 * @route POST /chat/:restaurantId
 * @desc Create or find chat between user and restaurant
 * @body { userId }
 */
router.post('/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  const { userId } = req.body;
  try {
    const chat = await ChatService.findOrCreateChat(
      Number(userId),
      Number(restaurantId),
    );
    res.json(chat);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to create or find chat', error: err });
  }
});

/**
 * @route GET /chat/:chatId/messages
 * @desc Get messages of a chat
 */
/**
 * @route GET /chat/:chatId/messages
 * @desc Get messages of a chat
 */
router.get('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;

  try {
    // validate chat exists
    const chat = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, Number(chatId)));
    if (chat.length === 0) {
      return res.status(400).json({ message: `chatId ${chatId} not found` });
    }

    // fetch messages
    const messages = await MessageService.getMessagesByChat(Number(chatId));
    res.json(messages);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    const detail = err?.cause?.detail ?? err?.message;
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: detail ?? String(err),
    });
  }
});

/**
 * @route POST /chat/:chatId/messages
 * @desc Send a message in a chat
 */
router.post('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { senderId, text, imgURL } = req.body;

  if (!senderId) {
    return res.status(400).json({ message: 'senderId is required' });
  }

  try {
    // validate chat exists
    const chat = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, Number(chatId)));
    if (chat.length === 0) {
      return res.status(400).json({ message: `chatId ${chatId} not found` });
    }

    // validate sender exists
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(senderId)));
    if (user.length === 0) {
      return res
        .status(400)
        .json({ message: `senderId ${senderId} not found` });
    }

    const newMessage = await MessageService.sendMessage({
      chatId: Number(chatId),
      senderId: Number(senderId),
      text,
      imgURL,
    });

    res.json(newMessage);
  } catch (err: any) {
    console.error('Error sending message:', err);
    const detail = err?.cause?.detail ?? err?.message;
    res.status(500).json({
      message: 'Failed to send message',
      error: detail ?? String(err),
    });
  }
});

router.get('/admin/:adminId',async (req, res) => {
  const { adminId } = req.params;
  try {
    const chats = await ChatService.getChatsByAdmin(Number(adminId));
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get admin chats', error: err });
  }
})

router.get('/admin/messages/:chatAdminId',async (req, res) => {
  const { chatAdminId } = req.params;
  try {
    const messages = await ChatService.getAdminChatMessages(Number(chatAdminId));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get admin chats', error: err });
  }
})

export default router;
