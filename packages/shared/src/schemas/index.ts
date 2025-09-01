import { z } from "zod";

export const Grade = z.enum(["A","B","C","D","E"]);
export type Grade = z.infer<typeof Grade>;

export const Pricing = z.object({
  baseRateBps: z.number(),
  loadingsBps: z.number(),
  discountsBps: z.number(),
  finalRateBps: z.number(),
  estimatedPremium: z.number()
});
export type Pricing = z.infer<typeof Pricing>;

export const QuoteDraft = z.object({
  companyId: z.string(),
  companyName: z.string(),
  obligee: z.string(),
  country: z.string(),
  bondType: z.enum(["Performance","Advance","Bid","Custom"]),
  amount: z.number().nonnegative(),
  tenorDays: z.number().int().positive(),
  riskNotes: z.string().optional().default(""),
  grade: Grade,
  pricing: Pricing,
  // New workflow fields (optional to maintain backward compatibility)
  intermediaryId: z.string().optional(),
  prospectCompanyAddress: z.string().optional(),
  businessUnit: z.string().optional(),
  debtTypeCode: z.string().optional(),
  depositionCountry: z.string().optional(),
  durationMonths: z.number().int().nonnegative().optional(),
  durationDays: z.number().int().nonnegative().optional(),
  hasContract: z.boolean().optional(),
  contractNumber: z.string().optional(),
  subcontractNumber: z.string().optional(),
  limitNumber: z.string().optional()
});
export type QuoteDraft = z.infer<typeof QuoteDraft>;

export const SanctionResult = z.object({
  status: z.enum(["PASS","REVIEW","FAIL"]),
  reason: z.string().optional()
});
export type SanctionResult = z.infer<typeof SanctionResult>;

export const SaveQuotationResult = z.object({
  quotationId: z.string(),
  expiresAt: z.string()
});
export type SaveQuotationResult = z.infer<typeof SaveQuotationResult>;

export const ChatMessage = z.object({
  id: z.string(),
  type: z.enum(["user", "agent"]),
  content: z.string(),
  timestamp: z.string(),
  toolChips: z.array(z.object({
    label: z.string(),
    value: z.string(),
    status: z.enum(["success", "warning", "error", "info"])
  })).optional()
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const BondRequestPayload = z.object({
  quotationId: z.string(),
  companyId: z.string(),
  bondType: z.string(),
  amount: z.number(),
  tenorDays: z.number(),
  pricing: z.object({
    finalRateBps: z.number(),
    estimatedPremium: z.number()
  }),
  attachments: z.array(z.string()),
  notes: z.string()
});
export type BondRequestPayload = z.infer<typeof BondRequestPayload>;

// New schemas for the updated workflow
export const IntermediaryValidationResponse = z.object({
  intermediaryId: z.string(),
  registered: z.boolean(),
  name: z.string().optional()
});
export type IntermediaryValidationResponse = z.infer<typeof IntermediaryValidationResponse>;

export const ProspectCompanyAddressPayload = z.object({
  companyId: z.string(),
  address: z.string()
});
export type ProspectCompanyAddressPayload = z.infer<typeof ProspectCompanyAddressPayload>; 