import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthRepository } from './domain/repositories/auth.repository';
import { AuthRepositoryImpl } from './infrastructure/repositories/auth.repository.impl';
import { authInterceptor } from './infrastructure/interceptors/auth.interceptor';
import { CompanyRepository } from './domain/repositories/company.repository';
import { CompanyRepositoryImpl } from './infrastructure/repositories/company.repository.impl';
import { StorageRepository } from './domain/repositories/storage.repository';
import { StorageRepositoryImpl } from './infrastructure/repositories/storage.repository.impl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AuthRepository, useClass: AuthRepositoryImpl },
    { provide: CompanyRepository, useClass: CompanyRepositoryImpl },
    { provide: StorageRepository, useClass: StorageRepositoryImpl }
  ]
};
