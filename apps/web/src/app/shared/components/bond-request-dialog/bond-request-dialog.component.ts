import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { QuoteDraft, BondRequestPayload } from '@bond-quotation/shared';

export interface BondRequestDialogData {
  quotationId: string;
  quoteDraft: QuoteDraft;
}

@Component({
  selector: 'app-bond-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>api</mat-icon>
      Bond Request Payload
    </h2>
    
    <mat-dialog-content>
      <p class="dialog-description">
        Your quotation has been saved successfully! Use the JSON payload below to submit the bond request via the API endpoint.
      </p>
      
      <div class="payload-section">
        <h3>API Endpoint</h3>
        <div class="endpoint">
          <code>POST /bondRequests</code>
        </div>
        
        <h3>Request Body</h3>
        <div class="json-container">
          <pre class="json-payload">{{ formattedPayload }}</pre>
        </div>
        
        <div class="copy-section">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="copyToClipboard()"
            class="copy-button">
            <mat-icon>content_copy</mat-icon>
            Copy JSON
          </button>
        </div>
      </div>
      
      <div class="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Copy the JSON payload above</li>
          <li>Send a POST request to <code>/bondRequests</code></li>
          <li>Set Content-Type header to <code>application/json</code></li>
          <li>Include the payload in the request body</li>
        </ol>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .payload-section {
      margin-bottom: 24px;
    }
    
    .payload-section h3 {
      margin: 16px 0 8px 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .endpoint {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    
    .endpoint code {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1976d2;
    }
    
    .json-container {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    
    .json-payload {
      margin: 0;
      padding: 16px;
      background: #f8f9fa;
      color: #333;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .copy-section {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .copy-button {
      min-width: 120px;
    }
    
    .instructions {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid #1976d2;
    }
    
    .instructions h3 {
      margin: 0 0 12px 0;
      color: #1976d2;
      font-size: 1rem;
      font-weight: 500;
    }
    
    .instructions ol {
      margin: 0;
      padding-left: 20px;
      color: #1976d2;
    }
    
    .instructions li {
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .instructions code {
      background: rgba(25, 118, 210, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      color: #1976d2;
    }
    
    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
    }
  `]
})
export class BondRequestDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BondRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BondRequestDialogData,
    private snackBar: MatSnackBar
  ) {}

  get formattedPayload(): string {
    const payload: BondRequestPayload = {
      quotationId: this.data.quotationId,
      companyId: this.data.quoteDraft.companyId,
      bondType: this.data.quoteDraft.bondType,
      amount: this.data.quoteDraft.amount,
      tenorDays: this.data.quoteDraft.tenorDays,
      pricing: {
        finalRateBps: this.data.quoteDraft.pricing.finalRateBps,
        estimatedPremium: this.data.quoteDraft.pricing.estimatedPremium
      },
      attachments: [],
      notes: "created by virtual agent v1"
    };
    
    return JSON.stringify(payload, null, 2);
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.formattedPayload).then(() => {
      this.snackBar.open('JSON payload copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center'
      });
    }).catch(() => {
      this.snackBar.open('Failed to copy to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'center'
      });
    });
  }
} 