import { Injectable, signal, computed } from '@angular/core';
import { QuoteDraft, Pricing, Grade } from '@bond-quotation/shared';

@Injectable({
  providedIn: 'root'
})
export class QuoteStore {
  private _quoteDraft = signal<QuoteDraft | null>(null);

  // Public signals
  quoteDraft = this._quoteDraft.asReadonly();
  
  // Computed values
  isComplete = computed(() => {
    const draft = this._quoteDraft();
    return draft && 
           draft.companyId && 
           draft.bondType && 
           draft.amount > 0 && 
           draft.tenorDays > 0 &&
           draft.pricing.finalRateBps > 0;
  });

  canUseRAG = computed(() => {
    const draft = this._quoteDraft();
    return draft?.grade && ['A', 'B', 'C'].includes(draft.grade);
  });

  estimatedPremium = computed(() => {
    const draft = this._quoteDraft();
    if (!draft) return 0;
    
    const { amount, tenorDays, pricing } = draft;
    if (pricing.finalRateBps <= 0) return 0;
    
    return Math.round((amount * pricing.finalRateBps / 10000 * (tenorDays/365)) * 100) / 100;
  });

  constructor() {
    this.initializeDefaultDraft();
  }

  private initializeDefaultDraft() {
    const defaultDraft: QuoteDraft = {
      companyId: '',
      companyName: '',
      obligee: '',
      country: '',
      bondType: 'Performance',
      amount: 0,
      tenorDays: 180,
      riskNotes: '',
      grade: 'B',
      pricing: {
        baseRateBps: 0,
        loadingsBps: 0,
        discountsBps: 0,
        finalRateBps: 0,
        estimatedPremium: 0
      }
    };
    
    this._quoteDraft.set(defaultDraft);
  }

  updateCompanyInfo(companyId: string, companyName: string, grade: Grade) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return {
        ...draft,
        companyId,
        companyName,
        grade
      };
    });
  }

  updateBondType(bondType: QuoteDraft['bondType']) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, bondType };
    });
  }

  updateAmount(amount: number) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, amount };
    });
  }

  updateTenor(tenorDays: number) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, tenorDays };
    });
  }

  updateCountry(country: string) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, country };
    });
  }

  updateObligee(obligee: string) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, obligee };
    });
  }

  updateRiskNotes(riskNotes: string) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, riskNotes };
    });
  }

  updatePricing(pricing: Partial<Pricing>) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return {
        ...draft,
        pricing: {
          ...draft.pricing,
          ...pricing
        }
      };
    });
  }

  updateQuoteDraft(updates: Partial<QuoteDraft>) {
    this._quoteDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, ...updates };
    });
  }

  reset() {
    this.initializeDefaultDraft();
  }
} 