import express from 'express';
import { adminRoleHandler, authHandler } from '../middleware/auth.middleware';
import ReportService from '../service/report.service';
import { reportUpdateSchema } from '../validators/report.validator';
import z from 'zod';

const router = express.Router();

router.patch('/:id', authHandler, adminRoleHandler, async (req, res) => {
  const reportId = z.number().parse(req.params.id);
  const updateData = reportUpdateSchema.parse(req.body);

  const updatedReport = await ReportService.updateReport(reportId, updateData);
  if (!updatedReport) {
    return res.status(404);
  }

  res.status(200).json(updatedReport);
});

export default router;
