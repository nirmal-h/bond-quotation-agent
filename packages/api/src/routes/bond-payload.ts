import { Router, Request, Response } from 'express';
import type { BondRequestPayload } from '@bond-quotation/shared';

const router = Router();

interface PayloadRequest {
  quotationId: string;
  quoteDraft: any;
}

router.post('/payload', (req: Request<{}, {}, PayloadRequest>, res: Response) => {
  try {
    const { quotationId, quoteDraft } = req.body;
    
    if (!quotationId || !quoteDraft) {
      return res.status(400).json({ 
        error: 'quotationId and quoteDraft are required' 
      });
    }
    
    const payload: BondRequestPayload = {
      quotationId,
      companyId: quoteDraft.companyId,
      bondType: quoteDraft.bondType,
      amount: quoteDraft.amount,
      tenorDays: quoteDraft.tenorDays,
      pricing: {
        finalRateBps: quoteDraft.pricing.finalRateBps,
        estimatedPremium: quoteDraft.pricing.estimatedPremium
      },
      attachments: [],
      notes: "created by virtual agent v1"
    };
    
    res.json({
      payload,
      message: 'Bond request payload generated successfully',
      timestamp: new Date().toISOString(),
      apiEndpoint: '/bondRequests',
      instructions: 'Use this payload to submit the bond request via the API endpoint'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate bond request payload' });
  }
});

export { router as bondPayloadRoutes }; 