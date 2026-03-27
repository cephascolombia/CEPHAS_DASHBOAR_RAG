import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable({
  providedIn: 'root'
})
export class UploadDocumentUseCase {
  constructor(private storageRepository: StorageRepository) {}

  execute(nit: string, file: File, subfolderPath?: string): Observable<any> {
    return this.storageRepository.uploadDocument(nit, file, subfolderPath);
  }
}
