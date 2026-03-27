import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';

@Injectable({
  providedIn: 'root'
})
export class DownloadZipUseCase {
  constructor(private storageRepository: StorageRepository) {}

  execute(nit: string, fileKeys: string[]): Observable<Blob> {
    return this.storageRepository.downloadZip(nit, fileKeys);
  }
}
