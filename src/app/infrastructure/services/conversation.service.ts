import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

export interface Conversation {
  id: string;
  email: string;
  title: string;
  createdAt: string;
}

export interface N8nMessage {
  id: number;
  sessionId: string;
  message: {
    type: 'human' | 'ai';
    content: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = `${environment.apiBaseUrl}${API_ENDPOINTS.CONVERSATIONS.BASE}`;

  constructor(private http: HttpClient) {}

  getConversations(email: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/${encodeURIComponent(email)}`);
  }

  createConversation(email: string, firstMessage: string): Observable<Conversation> {
    return this.http.post<Conversation>(this.apiUrl, { email, firstMessage });
  }

  getMessages(conversationId: string): Observable<N8nMessage[]> {
    return this.http.get<N8nMessage[]>(`${this.apiUrl}/${encodeURIComponent(conversationId)}/messages`);
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(conversationId)}`);
  }
}
