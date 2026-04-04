import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';
import { Role, CreateRoleRequest } from '../../domain/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);

  private get baseUrl() {
    return environment.apiBaseUrl;
  }

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}${API_ENDPOINTS.ROLES.GET_ALL}`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}${API_ENDPOINTS.ROLES.GET_BY_ID(id)}`);
  }

  create(role: CreateRoleRequest): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}${API_ENDPOINTS.ROLES.CREATE}`, role);
  }

  update(id: number, role: Partial<CreateRoleRequest>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}${API_ENDPOINTS.ROLES.UPDATE(id)}`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_ENDPOINTS.ROLES.DELETE(id)}`);
  }
}
