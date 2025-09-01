import { Routes } from '@angular/router';
import { ChatPageComponent } from './pages/chat/chat.page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'chat', component: ChatPageComponent },
  { path: '**', redirectTo: '/chat' }
]; 