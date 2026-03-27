import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyConfig, CompanyRepository } from '../../domain/repositories/company.repository';

@Injectable({
  providedIn: 'root'
})
export class GetCompanyConfigUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  execute(nit: string): Observable<CompanyConfig> {
    return this.companyRepository.getConfig(nit);
  }
}
