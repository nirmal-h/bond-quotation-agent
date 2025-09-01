import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { QuoteDraft } from '@bond-quotation/shared';

@Component({
  selector: 'app-quote-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Quote Builder</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Quote panel placeholder - will be enhanced later</p>
        <div *ngIf="quoteDraft">
          <p>Company: {{ quoteDraft.companyId }}</p>
          <p>Grade: {{ quoteDraft.grade }}</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./quote-panel.component.scss']
})
export class QuotePanelComponent {
  @Input() quoteDraft: QuoteDraft | null = null;
  @Output() quoteUpdated = new EventEmitter<QuoteDraft>();
} 