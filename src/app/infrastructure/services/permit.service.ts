import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';
import { Permit } from '../../domain/models/permit.model';

@Injectable({
  providedIn: 'root'
})
export class PermitService {
  private http = inject(HttpClient);

  private get baseUrl() {
    return environment.apiBaseUrl;
  }

  getAll(): Observable<Permit[]> {
    return this.http.get<Permit[]>(`${this.baseUrl}${API_ENDPOINTS.PERMIT.GET_ALL}`);
  }
}
