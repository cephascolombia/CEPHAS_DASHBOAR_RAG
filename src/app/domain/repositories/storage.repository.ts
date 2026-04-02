import { Observable } from 'rxjs';
import { StorageDocument } from '../models/storage-document.model';
import { CreateFolderRequest } from '../models/create-folder-request.model';

export abstract class StorageRepository {
  abstract listDocuments(nit: string, prefix?: string): Observable<StorageDocument[] | any>;
  abstract createFolder(request: CreateFolderRequest): Observable<any>;
  abstract uploadDocument(nit: string, file: File, subfolderPath?: string): Observable<any>;
  abstract deleteDocuments(nit: string, fileKeys: string[]): Observable<any>;
  abstract getPresignedUrl(nit: string, fileKey: string): Observable<{ url: string }>;
  abstract downloadZip(nit: string, fileKeys: string[]): Observable<Blob>;
  abstract syncRagDocuments(payload: any): Observable<any>;
}
