import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, User } from '../../domain/models/user.model';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl extends AuthRepository {

  constructor(private http: HttpClient) {
    super();
  }

  override login(request: LoginRequest): Observable<User> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
    return this.http.post<User>(url, request).pipe(
      tap(user => {
        if (user.token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
          localStorage.setItem(STORAGE_KEYS.NIT, user.companyNit ?? request.nit);
          localStorage.setItem(STORAGE_KEYS.USERNAME, user.email ?? request.email);
          localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(user.permissions || []));
        }
      })
    );
  }
}
