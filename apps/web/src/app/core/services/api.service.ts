import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Grade, 
  QuoteDraft, 
  SanctionResult, 
  SaveQuotationResult,
  BondRequestPayload,
  IntermediaryValidationResponse,
  ProspectCompanyAddressPayload 
} from '@bond-quotation/shared';

export interface CompanyGradeResponse {
  companyId: string;
  grade: Grade;
  timestamp: string;
}

export interface PricingQuery {
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

export interface PricingResponse {
  bands: Array<{ min: number; max: number }>;
  rules: string[];
  notes: string[];
  base: number;
  loadings: number;
  discounts: number;
  timestamp: string;
}

export interface SanctionCheckRequest {
  beneficiaryName: string;
  country: string;
  amount: number;
}

export interface BondPayloadRequest {
  quotationId: string;
  quoteDraft: QuoteDraft;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // New endpoints
  validateIntermediary(intermediaryId: string): Observable<IntermediaryValidationResponse> {
    return this.http.post<IntermediaryValidationResponse>(`${this.baseUrl}/irp/intermediary/validate`, { intermediaryId });
  }

  postCompanyAddress(payload: ProspectCompanyAddressPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/irp/company/address`, payload);
  }

  getCompanyGrade(companyId: string): Observable<CompanyGradeResponse> {
    return this.http.get<CompanyGradeResponse>(`${this.baseUrl}/irp/grade`, {
      params: { companyId }
    });
  }

  queryPricing(query: PricingQuery): Observable<PricingResponse> {
    return this.http.post<PricingResponse>(`${this.baseUrl}/rag/pricing`, query);
  }

  checkSanction(request: SanctionCheckRequest): Observable<SanctionResult> {
    return this.http.post<SanctionResult>(`${this.baseUrl}/sanction/check`, request);
  }

  saveQuotation(quoteDraft: QuoteDraft): Observable<SaveQuotationResult> {
    return this.http.post<SaveQuotationResult>(`${this.baseUrl}/quotation/save`, quoteDraft);
  }

  getQuotation(quotationId: string): Observable<QuoteDraft> {
    return this.http.get<QuoteDraft>(`${this.baseUrl}/quotation/${quotationId}`);
  }

  generateBondPayload(request: BondPayloadRequest): Observable<{
    payload: BondRequestPayload;
    message: string;
    timestamp: string;
    apiEndpoint: string;
    instructions: string;
  }> {
    return this.http.post<{
      payload: BondRequestPayload;
      message: string;
      timestamp: string;
      apiEndpoint: string;
      instructions: string;
    }>(`${this.baseUrl}/bond/payload`, request);
  }
} 