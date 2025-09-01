import { Injectable, inject } from '@angular/core';
import { ChatMessage, QuoteDraft, SanctionResult, SaveQuotationResult } from '@bond-quotation/shared';
import { ApiService } from './api.service';
import { QuoteStore } from '../state/quote.store';

 type ConversationStage =
  | 'intermediaryId'
  | 'companyId'
  | 'companyAddress'
  | 'businessUnit'
  | 'sanction'
  | 'debtTypeCode'
  | 'depositionCountry'
  | 'duration'
  | 'contractAsk'
  | 'contractNumber'
  | 'subcontractNumber'
  | 'limitNumber'
  | 'pricing';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiService = inject(ApiService);
  private quoteStore = inject(QuoteStore);

  private stage: ConversationStage = 'intermediaryId';
  private sanctionDone = false;

  async processMessage(userInput: string): Promise<ChatMessage> {
    const input = userInput.trim();
    const lower = input.toLowerCase();
    const draft = this.quoteStore.quoteDraft();

    // High-priority commands
    if (lower === 'restart' || lower === 'reset') {
      this.quoteStore.reset();
      this.stage = 'intermediaryId';
      this.sanctionDone = false;
      return this.reply('Session reset. Please provide your Intermediary ID (e.g., INT-100).', [{ label: 'Flow', value: 'Restarted', status: 'info' }]);
    }

    switch (this.stage) {
      case 'intermediaryId': {
        const match = input.match(/\bINT-\d{3}\b/i);
        if (!match) {
          return this.reply('Please provide your Intermediary ID (e.g., INT-100) to continue.');
        }
        const intermediaryId = match[0].toUpperCase();
        try {
          const res = await this.apiService.validateIntermediary(intermediaryId).toPromise();
          if (!res || !res.registered) {
            return this.reply(`Intermediary ${intermediaryId} is not registered. Please contact admin or provide a valid ID.`, [{ label: 'Intermediary', value: 'Unregistered', status: 'error' }]);
          }
          this.quoteStore.updateIntermediaryId(intermediaryId);
          this.stage = 'companyId';
          return this.reply(`Welcome ${res.name || intermediaryId}! Please provide:

- Prospect Company ID (e.g., C-001)`, [
            { label: 'Intermediary', value: intermediaryId, status: 'success' }
          ]);
        } catch {
          return this.reply('Failed to validate intermediary. Please try again later.', [{ label: 'Intermediary', value: 'Validation error', status: 'error' }]);
        }
      }

      case 'companyId': {
        const companyIdMatch = input.match(/\b[A-Z]-\d{3}\b/);
        if (!companyIdMatch) {
          return this.reply('Please provide Prospect Company ID (e.g., C-001).');
        }
        const companyId = companyIdMatch[0];
        // Fetch grade
        const gradeResp = await this.apiService.getCompanyGrade(companyId).toPromise();
        const grade = gradeResp?.grade as any;
        this.quoteStore.updateCompanyInfo(companyId, `Company ${companyId}`, grade);
        this.stage = 'companyAddress';
        return this.reply(`Got it. Company ID: ${companyId}. Grade: ${grade}.

Now, please provide the Prospect Company Address (free text).`, [
          { label: 'IRP', value: `Grade ${grade}`, status: 'success' }
        ]);
      }

      case 'companyAddress': {
        if (!input || input.length < 5) {
          return this.reply('Please provide a valid Prospect Company Address (at least 5 characters).');
        }
        const draftNow = this.quoteStore.quoteDraft();
        const companyId = draftNow?.companyId || 'UNKNOWN';
        try {
          await this.apiService.postCompanyAddress({ companyId, address: input }).toPromise();
          this.quoteStore.updateProspectCompanyAddress(input);
          this.stage = 'businessUnit';
          return this.reply('Address recorded. Please provide your Business Unit.');
        } catch {
          return this.reply('Failed to record address. Please try again.', [{ label: 'Company', value: 'Address error', status: 'error' }]);
        }
      }

      case 'businessUnit': {
        if (!input) {
          return this.reply('Please provide your Business Unit.');
        }
        this.quoteStore.updateBusinessUnit(input);
        // Immediate sanction check after collecting company details
        const sanctionMsg = await this.performImmediateSanctionCheck();
        this.stage = 'debtTypeCode';
        return sanctionMsg;
      }

      case 'debtTypeCode': {
        if (!input) {
          return this.reply('Please provide Debt Type Code.');
        }
        this.quoteStore.updateDebtTypeCode(input);
        this.stage = 'depositionCountry';
        return this.reply('Noted. Please provide Deposition Country.');
      }

      case 'depositionCountry': {
        if (!input) {
          return this.reply('Please provide Deposition Country.');
        }
        this.quoteStore.updateDepositionCountry(input);
        this.stage = 'duration';
        return this.reply('Please provide Duration. You can say like "6 months" or "180 days".');
      }

      case 'duration': {
        const monthsMatch = lower.match(/(\d+)\s*months?/);
        const daysMatch = lower.match(/(\d+)\s*days?/);
        const months = monthsMatch ? parseInt(monthsMatch[1]) : undefined;
        const days = daysMatch ? parseInt(daysMatch[1]) : undefined;
        if (!months && !days) {
          return this.reply('Please specify duration in months and/or days. Example: "6 months" or "180 days".');
        }
        this.quoteStore.updateDuration(months, days);
        // Map duration to tenorDays for pricing if days provided
        if (days) this.quoteStore.updateTenor(days);
        else if (months) this.quoteStore.updateTenor(months * 30);
        this.stage = 'contractAsk';
        return this.reply('Is there an existing contract? (yes/no)');
      }

      case 'contractAsk': {
        if (/(^y(es)?\b)/i.test(lower)) {
          this.quoteStore.updateHasContract(true);
          this.stage = 'contractNumber';
          return this.reply('Please provide Contract Number.');
        }
        if (/(^n(o)?\b)/i.test(lower)) {
          this.quoteStore.updateHasContract(false);
          this.stage = 'pricing';
          return this.showPricing();
        }
        return this.reply('Please answer yes or no. Is there an existing contract?');
      }

      case 'contractNumber': {
        if (!input) return this.reply('Please provide Contract Number.');
        this.quoteStore.updateContractInfo(input, undefined, undefined);
        this.stage = 'subcontractNumber';
        return this.reply('Please provide Subcontract Number.');
      }

      case 'subcontractNumber': {
        if (!input) return this.reply('Please provide Subcontract Number.');
        this.quoteStore.updateContractInfo(undefined, input, undefined);
        this.stage = 'limitNumber';
        return this.reply('Please provide Limit Number.');
      }

      case 'limitNumber': {
        if (!input) return this.reply('Please provide Limit Number.');
        this.quoteStore.updateContractInfo(undefined, undefined, input);
        this.stage = 'pricing';
        return this.showPricing();
      }

      case 'pricing': {
        return this.showPricing();
      }

      default:
        return this.reply('I did not understand that.');
    }
  }

  private async performImmediateSanctionCheck(): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    // Use company info; amount may be unknown at this stage
    const sanction = await this.runSanctionCheck();
    this.sanctionDone = true;
    return {
      id: Date.now().toString(),
      type: 'agent',
      content: `Sanction Check: ${sanction.status}${sanction.reason ? ` - ${sanction.reason}` : ''}

Company Grade: ${(draft?.grade) ?? 'N/A'}

Now I need additional details. Please provide Debt Type Code.`,
      timestamp: new Date().toISOString(),
      toolChips: [
        { label: 'Sanction', value: sanction.status, status: sanction.status === 'PASS' ? 'success' : sanction.status === 'REVIEW' ? 'warning' : 'error' },
        { label: 'IRP', value: `Grade ${draft?.grade ?? 'N/A'}`, status: 'info' }
      ]
    };
  }

  private async showPricing(): Promise<ChatMessage> {
    const draft = this.quoteStore.quoteDraft();
    // Simple pricing illustration: base by grade, random loadings
    const baseRate = draft?.grade === 'A' ? 200 : draft?.grade === 'B' ? 250 : 300;
    const finalRate = baseRate + 20; // example deterministic addition
    this.quoteStore.updatePricing({ baseRateBps: baseRate, finalRateBps: finalRate });
    return this.reply(`Pricing data ready.

- Grade: ${draft?.grade}
- Base Rate: ${baseRate} bps
- Final Rate: ${finalRate} bps
- Duration: ${draft?.durationMonths ?? 0} months, ${draft?.durationDays ?? draft?.tenorDays ?? 0} days

You can type "Finalize and save quotation" to save.`, [
      { label: 'RAG', value: 'Pricing Computed', status: 'success' }
    ]);
  }

  private reply(content: string, toolChips: NonNullable<ChatMessage['toolChips']> = []): ChatMessage {
    return {
      id: Date.now().toString(),
      type: 'agent',
      content,
      timestamp: new Date().toISOString(),
      toolChips
    };
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
    return { status: 'PASS', reason: 'No sanctions found' };
  }

  async finalizeQuotation(): Promise<SaveQuotationResult> {
    const draft = this.quoteStore.quoteDraft();
    if (!draft) {
      throw new Error('No quote draft to finalize');
    }
    return {
      quotationId: `Q-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
} 