import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { QuotePanelComponent } from '../../shared/components/quote-panel/quote-panel.component';
import { ChatMessageComponent } from '../../shared/components/chat-message/chat-message.component';
import { ToolChipComponent } from '../../shared/components/tool-chip/tool-chip.component';
import { BondRequestDialogComponent } from '../../shared/components/bond-request-dialog/bond-request-dialog.component';
import { AgentService } from '../../core/services/agent.service';
import { QuoteStore } from '../../core/state/quote.store';
import { ChatMessage, QuoteDraft, Grade } from '@bond-quotation/shared';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    QuotePanelComponent,
    ChatMessageComponent,
    ToolChipComponent
  ],
  template: `
    <div class="chat-container">
      <!-- Left Column: Chat -->
      <div class="chat-column">
        <div class="chat-header">
          <h2>Quote Specialist Agent</h2>
          <p>I'll help you create the best possible bond quotation</p>
        </div>
        
        <div class="chat-messages" #chatContainer>
          <app-chat-message
            *ngFor="let message of messages()"
            [message]="message">
          </app-chat-message>
        </div>
        
        <div class="chat-input-container">
          <mat-form-field appearance="outline" class="chat-input">
            <mat-label>Type your message...</mat-label>
            <input 
              matInput 
              [(ngModel)]="userInput" 
              (keyup.enter)="sendMessage()"
              placeholder="e.g., I need a performance bond for $2.5M">
            <mat-icon matSuffix>send</mat-icon>
          </mat-form-field>
          
          <button 
            mat-raised-button 
            color="primary" 
            (click)="sendMessage()"
            [disabled]="!userInput.trim()">
            Send
          </button>
        </div>
      </div>
      
      <!-- Right Column: Quote Panel -->
      <div class="quote-column">
        <app-quote-panel
          [quoteDraft]="quoteDraft()"
          (quoteUpdated)="onQuoteUpdated($event)">
        </app-quote-panel>
        
        <div class="action-buttons">
          <button 
            mat-raised-button 
            color="accent"
            (click)="finalizeAndSave()"
            [disabled]="!canFinalize()">
            <mat-icon>save</mat-icon>
            Finalize & Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
      height: calc(100vh - 64px);
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .chat-column {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .chat-header {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    
    .chat-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    .chat-header p {
      margin: 0;
      opacity: 0.9;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .chat-input-container {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .chat-input {
      flex: 1;
    }
    
    .quote-column {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 88px;
    }
    
    .action-buttons {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
    
    @media (max-width: 1024px) {
      .chat-container {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
      
      .quote-column {
        position: static;
        order: -1;
      }
    }
  `]
})
export class ChatPageComponent implements OnInit {
  private agentService = inject(AgentService);
  private quoteStore = inject(QuoteStore);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  userInput = '';
  messages = signal<ChatMessage[]>([]);
  quoteDraft = this.quoteStore.quoteDraft;
  
  canFinalize = computed(() => {
    const draft = this.quoteDraft();
    return draft && 
           draft.grade && 
           ['A', 'B', 'C'].includes(draft.grade) &&
           draft.pricing.finalRateBps > 0;
  });

  ngOnInit() {
    this.initializeChat();
  }

  private initializeChat() {
    // Welcome message
    this.addMessage({
      id: 'welcome',
      type: 'agent',
      content: `Hello! I'm your Quote Specialist Agent. I'm here to help you create the best possible bond quotation.

To get started, please provide:
1. Company ID (I'll fetch the grade from IRP)
2. Bond details (type, amount, tenor, etc.)

What can I help you with today?`,
      timestamp: new Date().toISOString()
    });
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: this.userInput,
      timestamp: new Date().toISOString()
    };
    
    this.addMessage(userMessage);
    const userInput = this.userInput;
    this.userInput = '';
    
    // Process with agent
    try {
      const response = await this.agentService.processMessage(userInput);
      this.addMessage(response);
    } catch (error) {
      this.snackBar.open('Error processing message', 'Close', { duration: 3000 });
    }
  }

  private addMessage(message: ChatMessage) {
    this.messages.update(messages => [...messages, message]);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  onQuoteUpdated(draft: QuoteDraft) {
    this.quoteStore.updateQuoteDraft(draft);
  }

  async finalizeAndSave() {
    try {
      const result = await this.agentService.finalizeQuotation();
      
      // Show bond request dialog
      const dialogRef = this.dialog.open(BondRequestDialogComponent, {
        width: '600px',
        data: { quotationId: result.quotationId, quoteDraft: this.quoteDraft() }
      });
      
      dialogRef.afterClosed().subscribe(() => {
        // Add final agent message
        this.addMessage({
          id: 'final',
          type: 'agent',
          content: `Perfect! Your quotation has been saved with ID: ${result.quotationId}

The quotation expires in 48 hours. Please create the bond request using the API endpoint:
POST /bondRequests

Use the JSON payload I provided in the dialog above.`,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (error) {
      this.snackBar.open('Error saving quotation', 'Close', { duration: 3000 });
    }
  }
} 