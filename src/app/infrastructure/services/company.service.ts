import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) { }

  getConfig(nit: string): Observable<any> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.COMPANY.CONFIG(nit)}`;
    return this.http.get<any>(url);
  }
}
