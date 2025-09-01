import { Router, Request, Response } from 'express';
import { Grade } from '@bond-quotation/shared';

const router = Router();

interface PricingQuery {
  query: string;
  context: {
    companyId: string;
    grade: Grade;
    bondType: string;
    country: string;
    amount: number;
    tenorDays: number;
  };
}

interface PricingData {
  baseRates: Record<Grade, number>;
  loadings: { country: number; tenor: number; type: number };
  discounts: { relationship: number; volume: number };
}

// Simple RAG pricing database (in-memory for now)
const pricingDatabase: Record<string, PricingData> = {
  'Performance': {
    baseRates: { A: 200, B: 250, C: 300, D: 400, E: 500 },
    loadings: { country: 20, tenor: 15, type: 1.0 },
    discounts: { relationship: 10, volume: 5 }
  },
  'Advance': {
    baseRates: { A: 220, B: 270, C: 320, D: 420, E: 520 },
    loadings: { country: 25, tenor: 20, type: 1.2 },
    discounts: { relationship: 12, volume: 6 }
  },
  'Bid': {
    baseRates: { A: 180, B: 230, C: 280, D: 380, E: 480 },
    loadings: { country: 15, tenor: 10, type: 0.8 },
    discounts: { relationship: 8, volume: 4 }
  },
  'Custom': {
    baseRates: { A: 210, B: 260, C: 310, D: 410, E: 510 },
    loadings: { country: 22, tenor: 18, type: 1.1 },
    discounts: { relationship: 11, volume: 5 }
  }
};

function searchPricing(query: string, context: { grade: Grade }) {
  // Simple keyword matching for demo
  const keywords = query.toLowerCase().split(' ');
  const results = [];
  
  for (const [bondType, data] of Object.entries(pricingDatabase)) {
    if (keywords.some(keyword => bondType.toLowerCase().includes(keyword))) {
      const baseRate = data.baseRates[context.grade] || data.baseRates.B;
      const loadings = data.loadings.country + data.loadings.tenor;
      const discounts = data.discounts.relationship + data.discounts.volume;
      
      results.push({
        bondType,
        baseRate,
        loadings,
        discounts,
        bands: [
          { min: baseRate - 20, max: baseRate + 40 },
          { min: baseRate - 10, max: baseRate + 30 }
        ],
        rules: [
          `Grade ${context.grade} base rate: ${baseRate} bps`,
          `Country loading: ${data.loadings.country} bps`,
          `Tenor loading: ${data.loadings.tenor} bps`,
          `Type multiplier: ${data.loadings.type}x`
        ],
        notes: [
          `Applicable for ${bondType} bonds`,
          `Grade ${context.grade} pricing tier`,
          `Standard loadings applied`
        ]
      });
    }
  }
  
  return results;
}

router.post('/pricing', (req: Request<{}, {}, PricingQuery>, res: Response) => {
  try {
    const { query, context } = req.body;
    
    if (!query || !context || !context.grade) {
      return res.status(400).json({ 
        error: 'query and context with grade are required' 
      });
    }
    
    // Grade gate: Only allow RAG for grades A, B, C
    if (!['A', 'B', 'C'].includes(context.grade)) {
      return res.status(403).json({ 
        error: `RAG access denied for grade ${context.grade}. Only grades A, B, and C are permitted.`,
        grade: context.grade
      });
    }
    
    const results = searchPricing(query, context);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'No pricing information found for the query',
        query,
        context
      });
    }
    
    const primaryResult = results[0];
    
    res.json({
      bands: primaryResult.bands,
      rules: primaryResult.rules,
      notes: primaryResult.notes,
      base: primaryResult.baseRate,
      loadings: primaryResult.loadings,
      discounts: primaryResult.discounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Pricing search failed' });
  }
});

export { router as ragRoutes }; 