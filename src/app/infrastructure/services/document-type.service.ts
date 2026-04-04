import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';
import { DocumentType } from '../../domain/models/document-type.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentTypeService {
  private http = inject(HttpClient);

  private get baseUrl() {
    return environment.apiBaseUrl;
  }

  getAll(): Observable<DocumentType[]> {
    return this.http.get<DocumentType[]>(`${this.baseUrl}${API_ENDPOINTS.DOCUMENT_TYPES.GET_ALL}`);
  }
}
