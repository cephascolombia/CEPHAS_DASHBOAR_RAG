import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ia-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia-chat.component.html',
  styleUrl: './ia-chat.component.css',
  host: { class: 'flex-1 flex flex-col min-h-0' }
})
export class IaChatComponent {
  chatInput = '';
  chatMessages: { role: 'user' | 'assistant', content: string }[] = [];

  sendMessage() {
    if (!this.chatInput.trim()) return;
    this.chatMessages.push({ role: 'user', content: this.chatInput });
    const userMessage = this.chatInput;
    this.chatInput = '';
    
    setTimeout(() => {
      this.chatMessages.push({ role: 'assistant', content: `Respuesta simulada para: "${userMessage}"` });
    }, 1000);
  }
}
