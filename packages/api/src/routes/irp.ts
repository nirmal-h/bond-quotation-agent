import { Router } from 'express';
import { Grade } from '@bond-quotation/shared';

const router = Router();

// Hardcoded company grade mapping (stub)
const companyGrades: Record<string, Grade> = {
  'C-001': 'A',
  'C-002': 'B',
  'C-003': 'C',
  'C-004': 'D',
  'C-005': 'E',
  'default': 'B'
};

router.get('/grade', (req, res) => {
  const { companyId } = req.query;
  
  if (!companyId || typeof companyId !== 'string') {
    return res.status(400).json({ error: 'companyId is required' });
  }

  const grade = companyGrades[companyId] || companyGrades.default;
  
  res.json({ 
    companyId, 
    grade,
    timestamp: new Date().toISOString()
  });
});

export { router as irpRoutes }; 