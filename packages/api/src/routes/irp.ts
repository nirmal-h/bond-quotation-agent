import { Router, Request, Response } from 'express';
import type { Grade } from '@bond-quotation/shared';
import { z } from 'zod';

const router = Router();

// Simulated registered intermediaries
const registeredIntermediaries = new Set<string>(['INT-100', 'INT-200', 'INT-300']);

// Validate intermediary registration
router.post('/intermediary/validate', (req: Request, res: Response) => {
  const schema = z.object({ intermediaryId: z.string().min(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid intermediaryId' });
  }
  const { intermediaryId } = parsed.data;
  const registered = registeredIntermediaries.has(intermediaryId);
  return res.json({ intermediaryId, registered, name: registered ? `Intermediary ${intermediaryId}` : undefined });
});

// Accept and store prospect company address (no response body required)
router.post('/company/address', (req: Request, res: Response) => {
  const schema = z.object({ companyId: z.string().min(1), address: z.string().min(5) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  // In a real system, persist the address. Here we just 204.
  return res.status(204).send();
});

// Existing company grade endpoint
router.get('/grade', (req: Request, res: Response) => {
  const companyId = (req.query.companyId as string) || 'C-001';
  const grade: Grade = companyId.includes('001') ? 'A' : companyId.includes('002') ? 'B' : 'C';
  res.json({ companyId, grade, timestamp: new Date().toISOString() });
});

export default router; 