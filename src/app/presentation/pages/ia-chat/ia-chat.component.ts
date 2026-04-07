import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { CompanyService } from '../../../infrastructure/services/company.service';

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

  constructor(private http: HttpClient, private authService: AuthService, private companyService: CompanyService) { }

  ngOnInit() {
    this.fetchCompanyConfig();
  }

  fetchCompanyConfig() {
    const nit = this.authService.getNit() || '';
    if (!nit) {
      console.warn('NIT no disponible');
      return;
    }

    this.companyService.getConfig(nit).subscribe({
      next: (config) => {
        console.log(config);
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

    const email = this.authService.getUsername();

    const payload = {
      email: email,
      message: userMessage,
      database: this.companyConfig?.connectionString || 'SYSTEM_RAG',
      model_ia_key: this.companyConfig?.api_key_model,
      ranker_cohere_api_key: this.companyConfig?.ranker_cohere_api_key
    };
    console.log(payload);
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
