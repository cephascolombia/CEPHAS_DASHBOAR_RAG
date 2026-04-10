import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { CompanyService } from '../../../infrastructure/services/company.service';
import { ConversationService, Conversation, N8nMessage } from '../../../infrastructure/services/conversation.service';

@Component({
  selector: 'app-ia-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia-chat.component.html',
  styleUrl: './ia-chat.component.css',
  host: { class: 'flex-1 flex flex-col min-h-0' }
})
export class IaChatComponent implements OnInit {
  chatInput = '';
  chatMessages: { role: 'user' | 'assistant', content: string }[] = [];
  isLoading = false;
  companyConfig: any = null;
  conversations: Conversation[] = [];
  activeConversationId: string | null = null;
  email: string = '';

  showDeleteModal = false;
  conversationToDelete: string | null = null;
  isDeleting = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private companyService: CompanyService,
    private conversationService: ConversationService
  ) { }

  ngOnInit() {
    this.email = this.authService.getUsername() || '';
    this.fetchCompanyConfig();
    this.loadConversations();
  }

  loadConversations() {
    if (!this.email) return;
    this.conversationService.getConversations(this.email).subscribe({
      next: (data) => {
        this.conversations = data;
      },
      error: (error) => console.error('Error fetching conversations', error)
    });
  }

  startNewConversation() {
    this.activeConversationId = null;
    this.chatMessages = [];
  }

  selectConversation(id: string) {
    this.activeConversationId = id;
    this.chatMessages = [];
    this.isLoading = true;

    this.conversationService.getMessages(id).subscribe({
      next: (messages: N8nMessage[]) => {
        this.chatMessages = messages.map(m => {
          let contentStr = '';
          try {
            // N8N messages usually have { type: 'human'|'ai', content: '...' }
            const msgData = typeof m.message === 'string' ? JSON.parse(m.message) : m.message;
            const kwargs = msgData.kwargs || msgData;
            contentStr = kwargs.content || JSON.stringify(msgData);
            return {
              role: (msgData.id?.includes('HumanMessage') || msgData.type === 'human') ? 'user' : 'assistant',
              content: contentStr
            };
          } catch (e) {
            return { role: 'assistant', content: 'Error parsing message history' };
          }
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.isLoading = false;
      }
    });
  }

  confirmDelete(id: string, event: Event) {
    event.stopPropagation();
    this.conversationToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.conversationToDelete = null;
  }

  executeDelete() {
    if (!this.conversationToDelete) return;
    this.isDeleting = true;
    
    this.conversationService.deleteConversation(this.conversationToDelete).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== this.conversationToDelete);
        if (this.activeConversationId === this.conversationToDelete) {
          this.startNewConversation();
        }
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.conversationToDelete = null;
      },
      error: (err) => {
        console.error('Error deleting conversation', err);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.conversationToDelete = null;
      }
    });
  }

  fetchCompanyConfig() {
    const nit = this.authService.getNit() || '';
    if (!nit) {
      console.warn('NIT no disponible');
      return;
    }

    this.companyService.getConfig(nit).subscribe({
      next: (config) => {
        this.companyConfig = config;
      },
      error: (err) => {
        console.error('Error fetching company config', err);
      }
    });
  }

  sendMessage() {
    if (!this.chatInput.trim() || this.isLoading) return;

    const userMessage = this.chatInput;
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatInput = '';
    this.isLoading = true;

    if (!this.companyConfig) {
      console.warn('Configuracion no disponible, intentando cargar de nuevo');
      this.fetchCompanyConfig();
    }

    // Asegurarse de que exista una conversación activa
    if (!this.activeConversationId) {
      this.conversationService.createConversation(this.email, userMessage).subscribe({
        next: (conv: Conversation) => {
          this.activeConversationId = conv.id;
          this.conversations.unshift(conv); // Anexar al inicio del sidebar
          this.sendWebhookPayload(userMessage);
        },
        error: (err) => {
          console.error('Error creating conversation', err);
          this.chatMessages.push({ role: 'assistant', content: 'No se pudo iniciar la conversación.' });
          this.isLoading = false;
        }
      });
    } else {
      this.sendWebhookPayload(userMessage);
    }
  }

  private sendWebhookPayload(userMessage: string) {
    const payload = {
      conversation_id: this.activeConversationId, // ID DINAMICO PARA N8N
      message: userMessage,
      database: this.companyConfig?.connectionString || 'SYSTEM_RAG',
      model_ia_key: this.companyConfig?.api_key_model,
      ranker_cohere_api_key: this.companyConfig?.ranker_cohere_api_key
    };
    const headers = new HttpHeaders({
      'WEB_HOOK_RAG': 'cephas_rag'
    });

    const webhookUrl = environment.webhookRagChat;

    this.http.post<any>(webhookUrl, payload, { headers }).subscribe({
      next: (response) => {
        const assistantMessage = response?.outPutchat || 'No se recibio respuesta.';
        this.chatMessages.push({ role: 'assistant', content: assistantMessage });
        this.isLoading = false;
      },
      error: (error) => {
        this.chatMessages.push({ role: 'assistant', content: 'Lo siento, ha ocurrido un error al procesar tu solicitud.' });
        console.error('Error in webhook request', error);
        this.isLoading = false;
      }
    });
  }
}
