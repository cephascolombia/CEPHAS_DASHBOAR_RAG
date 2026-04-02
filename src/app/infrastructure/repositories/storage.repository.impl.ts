import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';
import { StorageDocument } from '../../domain/models/storage-document.model';
import { CreateFolderRequest } from '../../domain/models/create-folder-request.model';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class StorageRepositoryImpl extends StorageRepository {

  constructor(private http: HttpClient) {
    super();
  }

  override listDocuments(nit: string, prefix?: string): Observable<StorageDocument[] | any> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.LIST(nit, prefix)}`;
    return this.http.get<StorageDocument[] | any>(url);
  }

  override createFolder(request: CreateFolderRequest): Observable<any> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.CREATE_FOLDER}`;
    return this.http.post<any>(url, request);
  }

  override uploadDocument(nit: string, file: File, subfolderPath?: string): Observable<any> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.UPLOAD}`;
    const formData = new FormData();
    formData.append('nit', nit);
    formData.append('file', file);
    if (subfolderPath) {
      formData.append('subfolderPath', subfolderPath);
    }

    // El HttpInterceptor inyectará el Bearer token automáticamente.
    // Al usar FormData, HttpClient ajustará automáticamente el Content-Type a multipart/form-data.
    return this.http.post<any>(url, formData);
  }

  override deleteDocuments(nit: string, fileKeys: string[]): Observable<any> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.DELETE}`;
    let params = new HttpParams().set('nit', nit);
    fileKeys.forEach(key => {
      params = params.append('fileKey', key);
    });
    return this.http.delete<any>(url, { params });
  }

  override getPresignedUrl(nit: string, fileKey: string): Observable<{ url: string }> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.PRESIGNED_URL(nit, fileKey)}`;
    return this.http.get<{ url: string }>(url);
  }

  override downloadZip(nit: string, fileKeys: string[]): Observable<Blob> {
    const url = `${environment.apiBaseUrl}${API_ENDPOINTS.STORAGE.DOWNLOAD_ZIP}`;
    const body = { nit, fileKeys };
    return this.http.post(url, body, { responseType: 'blob' });
  }

  override syncRagDocuments(payload: any): Observable<any> {
    const url = environment.webhookRagUrl;
    const headers = { 'WEB_HOOK_RAG': 'cephas_rag' };
    return this.http.post(url, payload, { headers });
  }
}

