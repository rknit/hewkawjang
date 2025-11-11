import express from 'express';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import ReportService from '../service/report.service';
import { reportUpdateSchema } from '../validators/report.validator';
import createHttpError from 'http-errors';

const router = express.Router();

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

  res.status(201).send('Message reported');
});

export default router;
