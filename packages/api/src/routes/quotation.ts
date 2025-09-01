import { Router, Request, Response } from 'express';
import { QuoteDraft, SaveQuotationResult } from '@bond-quotation/shared';

const router = Router();

// In-memory storage for quotations (stub)
const quotations = new Map<string, QuoteDraft & { id: string; createdAt: string; expiresAt: string }>();

function generateQuotationId(): string {
  return `Q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateExpiryDate(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 48); // 48 hours from now
  return expiry.toISOString();
}

router.post('/save', (req: Request<{}, {}, QuoteDraft>, res: Response) => {
  try {
    const quoteDraft = req.body;
    
    // Validate the quote draft
    if (!quoteDraft.companyId || !quoteDraft.bondType || !quoteDraft.amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: companyId, bondType, amount' 
      });
    }
    
    const quotationId = generateQuotationId();
    const expiresAt = calculateExpiryDate();
    
    const savedQuotation = {
      ...quoteDraft,
      id: quotationId,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    
    quotations.set(quotationId, savedQuotation);
    
    const result: SaveQuotationResult = {
      quotationId,
      expiresAt
    };
    
    res.json({
      ...result,
      message: 'Quotation saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save quotation' });
  }
});

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const quotation = quotations.get(id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve quotation' });
  }
});

export { router as quotationRoutes }; 