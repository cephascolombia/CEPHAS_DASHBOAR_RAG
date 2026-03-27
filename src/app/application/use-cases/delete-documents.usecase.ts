import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteDocumentsUseCase {
  constructor(private storageRepository: StorageRepository) {}

  execute(nit: string, fileKeys: string[]): Observable<any> {
    return this.storageRepository.deleteDocuments(nit, fileKeys);
  }
}
