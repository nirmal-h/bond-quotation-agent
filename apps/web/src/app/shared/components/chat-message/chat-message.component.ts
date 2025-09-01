import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ChatMessage } from '@bond-quotation/shared';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="message-container" [class.user-message]="message.type === 'user'">
      <div class="message-avatar">
        <mat-icon [class.agent-icon]="message.type === 'agent'">
          {{ message.type === 'user' ? 'person' : 'smart_toy' }}
        </mat-icon>
      </div>
      
      <div class="message-content">
        <mat-card class="message-card" [class.agent-card]="message.type === 'agent'">
          <mat-card-content>
            <div class="message-text" [innerHTML]="formatMessage(message.content)"></div>
            
            <div class="tool-chips" *ngIf="message.toolChips && message.toolChips.length > 0">
              <mat-chip 
                *ngFor="let chip of message.toolChips"
                [color]="getChipColor(chip.status)"
                selected>
                {{ chip.label }}: {{ chip.value }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>
        
        <div class="message-timestamp">
          {{ formatTimestamp(message.timestamp) }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message-container {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .message-container.user-message {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e0e0e0;
    }
    
    .message-avatar .agent-icon {
      color: #1976d2;
    }
    
    .message-content {
      flex: 1;
      max-width: 80%;
    }
    
    .user-message .message-content {
      text-align: right;
    }
    
    .message-card {
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: none;
    }
    
    .agent-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-left: 4px solid #1976d2;
    }
    
    .message-text {
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }
    
    .message-text strong {
      color: #1976d2;
    }
    
    .tool-chips {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .message-timestamp {
      font-size: 0.75rem;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    }
    
    .user-message .message-timestamp {
      text-align: right;
    }
    
    @media (max-width: 600px) {
      .message-content {
        max-width: 90%;
      }
      
      .tool-chips {
        justify-content: center;
      }
    }
  `]
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;

  formatMessage(content: string): string {
    // Convert markdown-style **text** to <strong>text</strong>
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  getChipColor(status: string): string {
    switch (status) {
      case 'success': return 'primary';
      case 'warning': return 'accent';
      case 'error': return 'warn';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }
} 