import express from 'express';
import ChatService from '../service/chat.service';
import MessageService from '../service/message.service'; // you'll add this soon
import { db } from '../db';
import { chatsTable, usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /chat/user/{userId}:
 *   get:
 *     summary: Get all chat channels for a specific user
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved user chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Failed to get user chats
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
 * @openapi
 * /chat/all/{userId}:
 *   get:
 *     summary: Get all chats where user is either a customer or restaurant owner
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved all chats for user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatWithDetails'
 *       500:
 *         description: Failed to fetch all chats
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
 * @openapi
 * /chat/{restaurantId}:
 *   post:
 *     summary: Create or find chat between user and restaurant
 *     tags:
 *       - Chat
 *     parameters:
 *       - $ref: '#/components/parameters/restaurantId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatRequest'
 *     responses:
 *       200:
 *         description: Successfully created or found chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Failed to create or find chat
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
 * @openapi
 * /chat/{chatId}/messages:
 *   get:
 *     summary: Get messages of a chat
 *     tags:
 *       - Chat
 *     parameters:
 *       - $ref: '#/components/parameters/chatId'
 *     responses:
 *       200:
 *         description: Successfully retrieved chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Chat not found
 *       500:
 *         description: Failed to fetch messages
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
 * @openapi
 * /chat/user/messages:
 *   post:
 *     summary: Send a message in a chat
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request - missing senderId or chat not found
 *       500:
 *         description: Failed to send message
 */
router.post('/user/messages', async (req, res) => {
  const { chatId, senderId, text, imgURL } = req.body;

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

/**
 * @openapi
 * /chat/admin/{adminId}:
 *   get:
 *     summary: Get all admin chats for a specific admin
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: adminId
 *         in: path
 *         required: true
 *         description: ID of the admin
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatAdmin'
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       500:
 *         description: Failed to get admin chats
 */
router.get(
  '/admin/:adminId',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const adminId = req.userAuthPayload?.userId!;
    try {
      const chats = await ChatService.getChatsByAdmin(Number(adminId));
      res.json(chats);
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Failed to get admin chats', error: err });
    }
  },
);

/**
 * @openapi
 * /chat/admin/messages/{chatAdminId}:
 *   get:
 *     summary: Get messages in an admin chat
 *     tags:
 *       - Chat
 *     parameters:
 *       - $ref: '#/components/parameters/chatAdminId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminMessage'
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       500:
 *         description: Failed to get admin chat messages
 */
router.get(
  '/admin/messages/:chatAdminId',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const { chatAdminId } = req.params;
    try {
      const messages = await ChatService.getAdminChatMessages(
        Number(chatAdminId),
      );
      res.json(messages);
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Failed to get admin chats', error: err });
    }
  },
);

/**
 * @openapi
 * /chat/admin/messages:
 *   post:
 *     summary: Send a message in an admin chat
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendAdminMessageRequest'
 *     responses:
 *       201:
 *         description: Admin message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminMessage'
 *       400:
 *         description: Missing required fields (chatAdminId, adminId, or senderRole)
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       500:
 *         description: Failed to create admin message
 */
router.post(
  '/admin/messages',
  authHandler,
  adminRoleHandler,
  async (req, res) => {
    const adminId = req.userAuthPayload?.userId!;
    const { chatAdminId, senderRole, text, imgURL } = req.body;
    console.log(chatAdminId, adminId, senderRole, text, imgURL);
    if (!chatAdminId || !adminId || !senderRole) {
      return res.status(400).json({
        message: 'chatAdminId, adminId and senderRole are required',
      });
    }

    try {
      const message = await ChatService.createAdminChatMessage({
        chatAdminId: Number(chatAdminId),
        senderId: Number(adminId),
        senderRole,
        text: text ?? null,
        imgURL: imgURL ?? null,
      });

      res.status(201).json(message);
    } catch (err) {
      console.error('[POST /admin/messages] ERROR:', err);
      res
        .status(500)
        .json({ message: 'Failed to create admin message', error: err });
    }
  },
);

export default router;
