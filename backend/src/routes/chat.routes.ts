import express from 'express';
import ChatService from '../service/chat.service';
import MessageService from '../service/message.service';
import { db } from '../db';
import { chatsTable, usersTable, chatAdminsTable } from '../db/schema';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import { eq, and } from 'drizzle-orm';

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
router.get('/user/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const cid = Number(chatId);
  if (!Number.isFinite(cid))
    return res.status(400).json({ message: 'chatId must be a number' });

  try {
    const chat = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, cid));
    if (chat.length === 0)
      return res.status(400).json({ message: `chatId ${cid} not found` });

    const messages = await MessageService.getMessagesByChat(cid);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: err?.message ?? String(err),
    });
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
router.post('/user/messages', async (req, res) => {
  const { chatId, senderId, text, imgURL } = req.body;
  const cid = Number(chatId);
  const sid = Number(senderId);
  if (!Number.isFinite(cid) || !Number.isFinite(sid)) {
    return res
      .status(400)
      .json({ message: 'chatId and senderId must be numbers' });
  }

  try {
    const chat = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, cid));
    if (chat.length === 0)
      return res.status(400).json({ message: `chatId ${cid} not found` });

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, sid));
    if (user.length === 0)
      return res.status(400).json({ message: `senderId ${sid} not found` });

    const newMessage = await MessageService.sendMessage({
      chatId: cid,
      senderId: sid,
      text,
      imgURL,
    });
    res.json(newMessage);
  } catch (err: any) {
    res.status(500).json({
      message: 'Failed to send message',
      error: err?.message ?? String(err),
    });
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
router.get('/user/all/:userId', async (req, res) => {
  const uid = Number(req.params.userId);
  if (!Number.isFinite(uid))
    return res.status(400).json({ message: 'userId must be a number' });

  try {
    const chats = await ChatService.getChatsForUserOrOwner(uid);
    res.json(chats);
  } catch (err: any) {
    res.status(500).json({
      message: 'Failed to fetch all user chats',
      error: err?.message ?? String(err),
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
router.get('/user/:userId', async (req, res) => {
  const uid = Number(req.params.userId);
  if (!Number.isFinite(uid))
    return res.status(400).json({ message: 'userId must be a number' });

  try {
    const chats = await ChatService.getChatsByUser(uid);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user chats', error: err });
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
router.post('/user/:restaurantId', async (req, res) => {
  const rid = Number(req.params.restaurantId);
  const uid = Number(req.body.userId);
  if (!Number.isFinite(uid) || !Number.isFinite(rid)) {
    return res.status(400).json({
      message: 'userId and restaurantId must be valid integers',
      userId: req.body.userId,
      restaurantId: req.params.restaurantId,
    });
  }

  try {
    const chat = await ChatService.findOrCreateChat(uid, rid);
    res.json(chat);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to create or find chat', error: err });
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
router.get(
  '/admin/:adminId',
  authHandler,
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
  '/admin/messages/:chatAdminId',
  authHandler,
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
router.post(
  '/admin/messages',
  authHandler,
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
router.get('/admin/user/:userId', async (req, res) => {
  const uid = Number(req.params.userId);
  if (!Number.isFinite(uid))
    return res.status(400).json({ message: 'userId must be a number' });

  try {
    const chats = await ChatService.getUserAdminChats(uid);
    res.json(chats);
  } catch (err: any) {
    res.status(500).json({
      message: 'Failed to get user admin chats',
      error: err?.message ?? String(err),
    });
  }
});

// USER-FACING: get admin chat messages (no admin role required)
router.get('/admin/messages/user/:chatAdminId', async (req, res) => {
  const chatAdminId = Number(req.params.chatAdminId);
  if (!Number.isFinite(chatAdminId)) {
    return res.status(400).json({ message: 'chatAdminId must be a number' });
  }

  try {
    const messages = await ChatService.getAdminChatMessages(chatAdminId);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({
      message: 'Failed to get admin chat messages',
      error: err?.message ?? String(err),
    });
  }
});

// USER-FACING: send message to admin (senderRole fixed to 'user')
router.post('/admin/messages/user', async (req, res) => {
  const { chatAdminId, userId, text, imgURL } = req.body;
  const cid = Number(chatAdminId);
  const uid = Number(userId);

  if (!Number.isFinite(cid) || !Number.isFinite(uid)) {
    return res
      .status(400)
      .json({ message: 'chatAdminId and userId must be numbers' });
  }

  try {
    // Simple ownership check: ensure this chatAdmin row belongs to the user
    const rows = await db
      .select()
      .from(chatAdminsTable)
      .where(eq(chatAdminsTable.id, cid));

    if (rows.length === 0) {
      return res.status(404).json({ message: `chatAdminId ${cid} not found` });
    }
    if (rows[0].userId !== uid) {
      return res
        .status(403)
        .json({ message: 'chatAdminId does not belong to user' });
    }

    const message = await ChatService.createAdminChatMessage({
      chatAdminId: cid,
      senderId: uid,
      senderRole: 'user',
      text: text ?? null,
      imgURL: imgURL ?? null,
    });

    res.status(201).json(message);
  } catch (err: any) {
    console.error('[POST /admin/messages/user] ERROR:', err);
    res.status(500).json({
      message: 'Failed to create admin message as user',
      error: err?.message ?? String(err),
    });
  }
});

// USER-FACING: ensure a user/admin chat exists, return its chatAdminId
router.post('/admin/user/start', async (req, res) => {
  const { userId, adminId } = req.body;
  const uid = Number(userId);
  const aid = Number(adminId ?? 1);

  if (!Number.isFinite(uid) || !Number.isFinite(aid)) {
    return res
      .status(400)
      .json({ message: 'userId and adminId must be numbers' });
  }

  try {
    const existing = await db
      .select()
      .from(chatAdminsTable)
      .where(
        and(eq(chatAdminsTable.userId, uid), eq(chatAdminsTable.adminId, aid)),
      );

    if (existing.length > 0) {
      return res.json({ chatAdminId: existing[0].id });
    }

    const inserted = await db
      .insert(chatAdminsTable)
      .values({ userId: uid, adminId: aid })
      .returning();

    return res.status(201).json({ chatAdminId: inserted[0].id });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to start admin chat',
      error: err?.message ?? String(err),
    });
  }
});

export default router;
