import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable({
  providedIn: 'root'
})
export class SyncRagDocumentsUseCase {
  private repository = inject(StorageRepository);

  execute(payload: any): Observable<any> {
    return this.repository.syncRagDocuments(payload);
  }
}
