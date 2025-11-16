import express from 'express';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import ReportService from '../service/report.service';
import { reportUpdateSchema } from '../validators/report.validator';
import createHttpError from 'http-errors';

const router = express.Router();

/**
 * @openapi
 * /reports/{id}:
 *   patch:
 *     summary: Update a report (admin only)
 *     tags:
 *       - Report
 *     parameters:
 *       - $ref: '#/components/parameters/reportId'
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportUpdateRequest'
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid report ID or update data
 *       401:
 *         $ref: '#/components/responses/AdminAuthUnauthorized'
 *       404:
 *         description: Report not found
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authHandler, adminRoleHandler, async (req, res) => {
  const reportId = Number(req.params.id);
  if (isNaN(reportId)) {
    return createHttpError.BadRequest('Invalid report ID');
  }
  const updateData = reportUpdateSchema.parse(req.body);

  const updatedReport = await ReportService.updateReport(reportId, updateData);
  if (!updatedReport) {
    return createHttpError.NotFound();
  }

  res.status(200).json(updatedReport);
});

/**
 * @openapi
 * /reports/message/{messageId}:
 *   post:
 *     summary: Report a message
 *     tags:
 *       - Report
 *     parameters:
 *       - $ref: '#/components/parameters/messageId'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Message reported successfully
 *       400:
 *         description: Invalid message ID
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/message/:messageId', authHandler, async (req, res) => {
  const messageId = Number(req.params.messageId);
  if (isNaN(messageId)) {
    return createHttpError.BadRequest('Invalid message ID');
  }
  const reporterUserId = req.userAuthPayload?.userId;
  if (!reporterUserId) {
    return createHttpError.Unauthorized();
  }

  await ReportService.reportMessage({
    reporterUserId,
    targetMessageId: messageId,
  });

  res.status(201).send();
});

export default router;
