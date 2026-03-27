import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token && token.trim().length > 0;
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getNit(): string | null {
    return localStorage.getItem(STORAGE_KEYS.NIT);
  }

  getUsername(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USERNAME);
  }

  getS3FolderName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.S3_FOLDER_NAME);
  }

  setS3FolderName(folder: string): void {
    localStorage.setItem(STORAGE_KEYS.S3_FOLDER_NAME, folder);
  }

  getCompanyName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.COMPANY_NAME);
  }

  setCompanyName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.COMPANY_NAME, name);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.NIT);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.S3_FOLDER_NAME);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_NAME);
  }
}
