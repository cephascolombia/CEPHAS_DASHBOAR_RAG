import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';
import { StorageDocument } from '../../domain/models/storage-document.model';

@Injectable({
  providedIn: 'root'
})
export class GetDocumentsUseCase {
  constructor(private storageRepository: StorageRepository) { }

  execute(nit: string, prefix?: string): Observable<StorageDocument[] | any> {
    return this.storageRepository.listDocuments(nit, prefix);
  }
}
