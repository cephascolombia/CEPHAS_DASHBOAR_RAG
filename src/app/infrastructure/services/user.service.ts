import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';
import { UserListItem, UserListResponse, CreateUserRequest } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private get baseUrl() {
    return environment.apiBaseUrl;
  }

  getAll(pageNumber = 1, pageSize = 10): Observable<UserListItem[] | UserListResponse> {
    return this.http.get<UserListItem[] | UserListResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.GET_ALL(pageNumber, pageSize)}`
    );
  }

  getById(id: number): Observable<UserListItem> {
    return this.http.get<UserListItem>(`${this.baseUrl}${API_ENDPOINTS.USERS.GET_BY_ID(id)}`);
  }

  create(user: CreateUserRequest): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.baseUrl}${API_ENDPOINTS.USERS.CREATE}`, user);
  }

  update(id: number, user: Partial<CreateUserRequest>): Observable<UserListItem> {
    return this.http.put<UserListItem>(`${this.baseUrl}${API_ENDPOINTS.USERS.UPDATE(id)}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_ENDPOINTS.USERS.DELETE(id)}`);
  }
}
