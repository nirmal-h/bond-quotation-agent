import { Router, Request, Response } from 'express';
import { SanctionResult } from '@bond-quotation/shared';

const router = Router();

interface SanctionCheckBody {
  beneficiaryName: string;
  country: string;
  amount: number;
}

// Hardcoded sanction check (stub)
function performSanctionCheck(data: SanctionCheckBody): SanctionResult {
  const { beneficiaryName, country, amount } = data;
  
  // Simple rules for demonstration
  if (beneficiaryName.toLowerCase().includes('sanctioned')) {
    return { status: 'FAIL', reason: 'Beneficiary name contains restricted terms' };
  }
  
  if (country === 'XX') {
    return { status: 'REVIEW', reason: 'Country requires manual review' };
  }
  
  if (amount > 10000000) {
    return { status: 'REVIEW', reason: 'Amount exceeds automatic approval threshold' };
  }
  
  return { status: 'PASS' };
}

router.post('/check', (req: Request<{}, {}, SanctionCheckBody>, res: Response) => {
  try {
    const { beneficiaryName, country, amount } = req.body;
    
    if (!beneficiaryName || !country || typeof amount !== 'number') {
      return res.status(400).json({ 
        error: 'beneficiaryName, country, and amount are required' 
      });
    }
    
    const result = performSanctionCheck({ beneficiaryName, country, amount });
    
    res.json({
      ...result,
      timestamp: new Date().toISOString(),
      requestData: { beneficiaryName, country, amount }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sanction check failed' });
  }
});

export { router as sanctionRoutes }; 