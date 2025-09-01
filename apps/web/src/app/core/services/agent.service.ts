import { Injectable, inject } from '@angular/core';
import { ChatMessage, QuoteDraft, SanctionResult, SaveQuotationResult } from '@bond-quotation/shared';
import { ApiService } from './api.service';
import { QuoteStore } from '../state/quote.store';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiService = inject(ApiService);
  private quoteStore = inject(QuoteStore);

  async processMessage(userInput: string): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    
    // Check for specific commands first
    const input = userInput.toLowerCase().trim();
    
    if (input.includes('sanction check') || input.includes('run sanction')) {
      return this.handleSanctionCheck();
    }
    
    if (input.includes('finalize') || input.includes('save quotation')) {
      return this.handleFinalization();
    }
    
    // If we already have company grade, try to process bond request
    if (draft?.grade) {
      const bondRequest = this.parseBondRequest(userInput);
      if (bondRequest) {
        return this.handleBondRequest(bondRequest);
      }
    }
    
    // Check for company ID if no grade yet
    const companyIdMatch = userInput.match(/\b[A-Z]-\d{3}\b/);
    if (companyIdMatch) {
      return this.handleCompanyIdExtraction(companyIdMatch[0]);
    }
    
    // If we have grade but no bond request, guide user
    if (draft?.grade) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: `I have your company grade (${draft.grade}). Now I need bond details to provide pricing. Please specify:

- Bond type (Performance, Advance, Bid, or Custom)
- Amount (e.g., $2M, $500K)
- Tenor in days (e.g., 180, 365)
- Country (e.g., US, UK, Canada)

Example: "Performance bond, $2M, 180 days, US"`,
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'IRP',
          value: `Grade ${draft.grade}`,
          status: 'success'
        }]
      };
    }
    
    return {
      id: Date.now().toString(),
      type: 'agent',
      content: `I understand you're looking for bond quotation help. Please provide your company ID (e.g., C-001) to get started.`,
      timestamp: new Date().toISOString(),
      toolChips: [{
        label: 'IRP',
        value: 'Ready to fetch company grade',
        status: 'info'
      }]
    };
  }

  private parseBondRequest(userInput: string): any {
    const input = userInput.toLowerCase();
    
    // Extract bond type
    let bondType: QuoteDraft['bondType'] = 'Custom';
    if (input.includes('performance')) bondType = 'Performance';
    else if (input.includes('advance')) bondType = 'Advance';
    else if (input.includes('bid')) bondType = 'Bid';
    
    // Extract amount
    const amountMatch = userInput.match(/\$?(\d+(?:\.\d+)?)\s*([MK])?/i);
    let amount = 0;
    if (amountMatch) {
      const num = parseFloat(amountMatch[1]);
      const multiplier = amountMatch[2]?.toUpperCase();
      if (multiplier === 'M') amount = num * 1000000;
      else if (multiplier === 'K') amount = num * 1000;
      else amount = num;
    }
    
    // Extract tenor
    const tenorMatch = userInput.match(/(\d+)\s*days?/i);
    const tenorDays = tenorMatch ? parseInt(tenorMatch[1]) : 0;
    
    // Extract country
    const countryMatch = userInput.match(/\b(US|UK|Canada|Australia|Germany|France|Japan|China|India|Brazil)\b/i);
    const country = countryMatch ? countryMatch[1] : 'US';
    
    // Only return if we have meaningful data
    if (amount > 0 && tenorDays > 0) {
      return { bondType, amount, tenorDays, country };
    }
    
    return null;
  }

  private async handleBondRequest(bondRequest: any): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    if (!draft) {
      throw new Error('No quote draft available');
    }
    
    // Update quote draft with bond details using available methods
    this.quoteStore.updateBondType(bondRequest.bondType);
    this.quoteStore.updateAmount(bondRequest.amount);
    this.quoteStore.updateTenor(bondRequest.tenorDays);
    this.quoteStore.updateCountry(bondRequest.country);
    
    // Simulate RAG pricing
    const baseRate = draft.grade === 'A' ? 200 : draft.grade === 'B' ? 250 : 300;
    const finalRate = baseRate + Math.floor(Math.random() * 50);
    const premium = (bondRequest.amount * finalRate * bondRequest.tenorDays) / (365 * 10000);
    
    // Update pricing
    this.quoteStore.updatePricing({
      baseRateBps: baseRate,
      finalRateBps: finalRate,
      estimatedPremium: premium
    });
    
    return {
      id: Date.now().toString(),
      type: 'agent',
      content: `Perfect! I've fetched pricing for your ${bondRequest.bondType} bond:

**Bond Details:**
- Type: ${bondRequest.bondType}
- Amount: $${bondRequest.amount.toLocaleString()}
- Tenor: ${bondRequest.tenorDays} days
- Country: ${bondRequest.country}

**Pricing:**
- Base Rate: ${baseRate} bps
- Final Rate: ${finalRate} bps
- Estimated Premium: $${premium.toFixed(2)}

The quote panel on the right has been updated with all details. 

Next steps:
1. **Run sanction check** - Type: "Run sanction check"
2. **Finalize quotation** - Type: "Finalize and save quotation"`,
      timestamp: new Date().toISOString(),
      toolChips: [
        {
          label: 'IRP',
          value: `Grade ${draft.grade}`,
          status: 'success'
        },
        {
          label: 'RAG',
          value: 'Pricing Retrieved',
          status: 'success'
        }
      ]
    };
  }

  private async handleCompanyIdExtraction(companyId: string): Promise<ChatMessage> {
    try {
      // Simulate company grade lookup
      const grade = companyId.includes('001') ? 'A' : 'B';
      
      // Update quote draft with company info
      this.quoteStore.updateCompanyInfo(companyId, `Company ${companyId}`, grade as any);
      
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: `Great! I've fetched your company's grade from IRP: **${grade}**

${this.getGradeMessage(grade as any)}

Now I can help you with bond pricing. What type of bond do you need? Please provide:
- Bond type (Performance, Advance, Bid, or Custom)
- Amount
- Tenor in days
- Country`,
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'IRP',
          value: `Grade ${grade}`,
          status: 'success'
        }]
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: `Sorry, I couldn't fetch the company grade for ${companyId}. Please try again or contact support.`,
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'IRP',
          value: 'Failed to fetch grade',
          status: 'error'
        }]
      };
    }
  }

  private getGradeMessage(grade: string): string {
    switch (grade) {
      case 'A':
      case 'B':
      case 'C':
        return `✅ Your grade qualifies for automated RAG pricing! I can fetch competitive rates for you.`;
      case 'D':
      case 'E':
        return `⚠️ Your grade requires manual underwriting. RAG pricing is not available, but I can help you prepare your quotation for manual review.`;
      default:
        return `Grade information processed.`;
    }
  }

  async runSanctionCheck(): Promise<SanctionResult> {
    // Simulate sanction check
    return {
      status: 'PASS',
      reason: 'No sanctions found'
    };
  }

  async finalizeQuotation(): Promise<SaveQuotationResult> {
    const draft = this.quoteStore.quoteDraft();
    if (!draft) {
      throw new Error('No quote draft to finalize');
    }

    // Simulate saving quotation
    return {
      quotationId: `Q-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private async handleSanctionCheck(): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    if (!draft) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: 'No quote draft available. Please start by providing your company ID.',
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'Error',
          value: 'No draft available',
          status: 'error'
        }]
      };
    }
    
    try {
      const sanctionResult = await this.runSanctionCheck();
      
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: `✅ **Sanction Check Completed: ${sanctionResult.status}**

${sanctionResult.reason ? `Reason: ${sanctionResult.reason}` : ''}

Your quotation has passed the automated compliance check and is ready for finalization.

**Next step:** Type "Finalize and save quotation" to complete the process.`,
        timestamp: new Date().toISOString(),
        toolChips: [
          {
            label: 'IRP',
            value: `Grade ${draft.grade}`,
            status: 'success'
          },
          {
            label: 'RAG',
            value: 'Pricing Retrieved',
            status: 'success'
          },
          {
            label: 'Sanction',
            value: sanctionResult.status,
            status: sanctionResult.status === 'PASS' ? 'success' : 'error'
          }
        ]
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: '❌ Sanction check failed. Please try again or contact support.',
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'Sanction',
          value: 'Check Failed',
          status: 'error'
        }]
      };
    }
  }

  private async handleFinalization(): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    if (!draft) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: 'No quote draft available. Please start by providing your company ID.',
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'Error',
          value: 'No draft available',
          status: 'error'
        }]
      };
    }
    
    try {
      const result = await this.finalizeQuotation();
      
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: `🎉 **Quotation Successfully Saved!**

**Quotation ID:** ${result.quotationId}
**Expires:** ${new Date(result.expiresAt).toLocaleDateString()}

Your bond quotation has been finalized and saved. The system has generated a bond request payload that can be submitted to the bond issuance system.

**Summary:**
- Company: ${draft.companyName} (Grade ${draft.grade})
- Bond: ${draft.bondType} - $${draft.amount.toLocaleString()}
- Premium: $${draft.pricing.estimatedPremium.toFixed(2)}

Thank you for using the Bond Quotation Agent! 🚀`,
        timestamp: new Date().toISOString(),
        toolChips: [
          {
            label: 'IRP',
            value: `Grade ${draft.grade}`,
            status: 'success'
          },
          {
            label: 'RAG',
            value: 'Pricing Retrieved',
            status: 'success'
          },
          {
            label: 'Sanction',
            value: 'PASS',
            status: 'success'
          },
          {
            label: 'Save',
            value: 'Quotation Saved',
            status: 'success'
          }
        ]
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'agent',
        content: '❌ Failed to save quotation. Please try again or contact support.',
        timestamp: new Date().toISOString(),
        toolChips: [{
          label: 'Save',
          value: 'Save Failed',
          status: 'error'
        }]
      };
    }
  }
} 