import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyConfig, CompanyRepository } from '../../domain/repositories/company.repository';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CompanyRepositoryImpl extends CompanyRepository {

  constructor(private http: HttpClient) {
    super();
  }

  override getConfig(nit: string): Observable<CompanyConfig> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.COMPANY.CONFIG(nit)}`;
    return this.http.get<CompanyConfig>(url);
  }
}
