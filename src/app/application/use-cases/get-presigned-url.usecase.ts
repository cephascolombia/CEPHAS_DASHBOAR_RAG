import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable({
  providedIn: 'root'
})
export class GetPresignedUrlUseCase {
  constructor(private storageRepository: StorageRepository) {}

  execute(nit: string, fileKey: string): Observable<{ url: string }> {
    return this.storageRepository.getPresignedUrl(nit, fileKey);
  }
}
