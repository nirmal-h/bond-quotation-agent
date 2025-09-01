import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create RAG seed directory
const ragDir = join(process.cwd(), 'src', 'rag', 'seed');
mkdirSync(ragDir, { recursive: true });

// Seed pricing tiers
const pricingTiers = `# Bond Pricing Tiers by Company Grade

## Grade A Companies
- Base Rate Range: 180-220 bps
- Minimum Premium: $1,000
- Exclusions: None

## Grade B Companies  
- Base Rate Range: 230-270 bps
- Minimum Premium: $2,500
- Exclusions: High-risk countries

## Grade C Companies
- Base Rate Range: 280-320 bps
- Minimum Premium: $5,000
- Exclusions: Sanctioned countries, high-risk industries

## Grade D Companies
- Base Rate Range: 380-420 bps
- Minimum Premium: $10,000
- Exclusions: Manual review required

## Grade E Companies
- Base Rate Range: 480-520 bps
- Minimum Premium: $25,000
- Exclusions: Manual review required, additional documentation
`;

// Seed loadings
const loadings = `# Bond Pricing Loadings

## Country Risk Loadings
- US/Canada: 0-5 bps
- UK/Germany: 10-15 bps
- France/Italy: 20-30 bps
- Other EU: 25-35 bps
- Emerging Markets: 40-60 bps

## Tenor Bands
- 0-90 days: 0 bps
- 91-180 days: 5 bps
- 181-365 days: 10 bps
- 366+ days: 20 bps

## Bond Type Multipliers
- Performance: 1.0x
- Advance: 1.2x
- Bid: 0.8x
- Custom: 1.1x
`;

// Seed discounts
const discounts = `# Bond Pricing Discounts

## Relationship Discounts
- Premium Partner: 20 bps
- Standard Partner: 10 bps
- New Partner: 0 bps

## Volume Discounts
- $1M - $5M: 5 bps
- $5M - $10M: 10 bps
- $10M+: 15 bps

## Special Considerations
- Multi-year contracts: +5 bps discount
- Collateral provided: +10 bps discount
- Government contracts: +15 bps discount
`;

// Write seed files
writeFileSync(join(ragDir, 'pricing-tiers.md'), pricingTiers);
writeFileSync(join(ragDir, 'loadings.md'), loadings);
writeFileSync(join(ragDir, 'discounts.md'), discounts);

console.log('✅ RAG seed data created successfully!');
console.log('📁 Files created in:', ragDir);
console.log('📊 Pricing tiers, loadings, and discounts seeded'); 