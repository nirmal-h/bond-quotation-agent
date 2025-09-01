import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="toolbar-title">
        <mat-icon>account_balance</mat-icon>
        Bond Quotation Agent
      </span>
      <span class="spacer"></span>
      <mat-slide-toggle 
        [checked]="isDarkTheme()" 
        (change)="toggleTheme($event.checked)"
        color="accent">
        {{ isDarkTheme() ? '🌙' : '☀️' }} Theme
      </mat-slide-toggle>
    </mat-toolbar>
    
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      min-height: calc(100vh - 64px);
      background-color: var(--mat-app-background);
    }
  `]
})
export class AppComponent {
  isDarkTheme = signal(false);

  toggleTheme(isDark: boolean) {
    this.isDarkTheme.set(isDark);
    document.body.classList.toggle('dark-theme', isDark);
  }
} 