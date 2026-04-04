import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';
import { Permission, CreatePermissionRequest } from '../../domain/models/permission.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get baseUrl() {
    return environment.apiBaseUrl;
  }

  private get nit() {
    return this.authService.getNit() || '';
  }

  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}${API_ENDPOINTS.PERMISSIONS.GET_ALL(this.nit)}`);
  }

  getById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.baseUrl}${API_ENDPOINTS.PERMISSIONS.GET_BY_ID(this.nit, id)}`);
  }

  create(permission: CreatePermissionRequest): Observable<Permission> {
    return this.http.post<Permission>(`${this.baseUrl}${API_ENDPOINTS.PERMISSIONS.CREATE}`, permission);
  }

  update(id: number, permission: Partial<CreatePermissionRequest>): Observable<Permission> {
    return this.http.put<Permission>(`${this.baseUrl}${API_ENDPOINTS.PERMISSIONS.UPDATE(id)}`, permission);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_ENDPOINTS.PERMISSIONS.DELETE(this.nit, id)}`);
  }
}
