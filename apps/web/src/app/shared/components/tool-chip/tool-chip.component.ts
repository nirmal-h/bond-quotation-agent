import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export interface ToolChip {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

@Component({
  selector: 'app-tool-chip',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <mat-chip 
      [color]="getChipColor(toolChip.status)"
      selected
      class="tool-chip">
      <mat-icon class="chip-icon">
        {{ getChipIcon(toolChip.status) }}
      </mat-icon>
      <span class="chip-label">{{ toolChip.label }}</span>
      <span class="chip-value">{{ toolChip.value }}</span>
    </mat-chip>
  `,
  styles: [`
    .tool-chip {
      font-size: 0.875rem;
      height: 28px;
      border-radius: 14px;
    }
    
    .chip-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    
    .chip-label {
      font-weight: 500;
      margin-right: 4px;
    }
    
    .chip-value {
      font-weight: 600;
      opacity: 0.9;
    }
    
    .tool-chip.mat-mdc-chip.mat-mdc-chip-selected.mat-primary {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .tool-chip.mat-mdc-chip.mat-mdc-chip-selected.mat-accent {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .tool-chip.mat-mdc-chip.mat-mdc-chip-selected.mat-warn {
      background-color: #ffebee;
      color: #d32f2f;
    }
  `]
})
export class ToolChipComponent {
  @Input() toolChip!: ToolChip;

  getChipColor(status: string): string {
    switch (status) {
      case 'success': return 'primary';
      case 'warning': return 'accent';
      case 'error': return 'warn';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  getChipIcon(status: string): string {
    switch (status) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  }
} 