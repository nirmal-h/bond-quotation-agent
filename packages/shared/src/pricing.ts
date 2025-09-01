export function computePricing({
  bandMin, bandMax, base, loadings, discounts, amount, tenorDays
}: {
  bandMin: number; bandMax: number; base: number; loadings: number; discounts: number; amount: number; tenorDays: number;
}) {
  const raw = base + loadings - discounts;
  const finalRateBps = Math.max(bandMin, Math.min(bandMax, raw));
  const estimatedPremium = Math.round((amount * finalRateBps / 10000 * (tenorDays/365)) * 100) / 100;
  return { finalRateBps, estimatedPremium };
}

export function calculateLoadings({
  country,
  tenorDays,
  bondType
}: {
  country: string;
  tenorDays: number;
  bondType: string;
}): number {
  // Country risk loadings (hardcoded for now)
  const countryRisk: Record<string, number> = {
    'US': 0,
    'CA': 5,
    'UK': 10,
    'DE': 15,
    'FR': 20,
    'IT': 30,
    'ES': 35,
    'default': 25
  };

  // Tenor loadings
  let tenorLoading = 0;
  if (tenorDays > 365) tenorLoading = 20;
  else if (tenorDays > 180) tenorLoading = 10;
  else if (tenorDays > 90) tenorLoading = 5;

  // Bond type multipliers
  const typeMultipliers: Record<string, number> = {
    'Performance': 1.0,
    'Advance': 1.2,
    'Bid': 0.8,
    'Custom': 1.1
  };

  const baseCountryRisk = countryRisk[country] || countryRisk.default;
  const typeMultiplier = typeMultipliers[bondType] || 1.0;

  return Math.round((baseCountryRisk + tenorLoading) * typeMultiplier);
}

export function calculateDiscounts({
  relationship,
  volume
}: {
  relationship: string;
  volume: number;
}): number {
  let relationshipDiscount = 0;
  if (relationship === 'premium') relationshipDiscount = 20;
  else if (relationship === 'standard') relationshipDiscount = 10;
  else if (relationship === 'new') relationshipDiscount = 0;

  let volumeDiscount = 0;
  if (volume > 10000000) volumeDiscount = 15;
  else if (volume > 5000000) volumeDiscount = 10;
  else if (volume > 1000000) volumeDiscount = 5;

  return relationshipDiscount + volumeDiscount;
} 