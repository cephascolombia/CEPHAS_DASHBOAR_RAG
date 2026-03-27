import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageRepository } from '../../domain/repositories/storage.repository';
import { CreateFolderRequest } from '../../domain/models/create-folder-request.model';

@Injectable({
  providedIn: 'root'
})
export class CreateFolderUseCase {
  constructor(private storageRepository: StorageRepository) {}

  execute(request: CreateFolderRequest): Observable<any> {
    return this.storageRepository.createFolder(request);
  }
}
