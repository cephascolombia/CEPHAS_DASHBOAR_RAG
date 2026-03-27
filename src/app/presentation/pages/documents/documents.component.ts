import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { GetDocumentsUseCase } from '../../../application/use-cases/get-documents.usecase';
import { CreateFolderUseCase } from '../../../application/use-cases/create-folder.usecase';
import { UploadDocumentUseCase } from '../../../application/use-cases/upload-document.usecase';
import { DeleteDocumentsUseCase } from '../../../application/use-cases/delete-documents.usecase';
import { DownloadZipUseCase } from '../../../application/use-cases/download-zip.usecase';
import { GetPresignedUrlUseCase } from '../../../application/use-cases/get-presigned-url.usecase';
import { StorageDocument } from '../../../domain/models/storage-document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
  host: { class: 'flex-1 flex flex-col min-h-0' }
})
export class DocumentsComponent implements OnInit {
  private authService = inject(AuthService);
  private getDocumentsUseCase = inject(GetDocumentsUseCase);
  private createFolderUseCase = inject(CreateFolderUseCase);
  private uploadDocumentUseCase = inject(UploadDocumentUseCase);
  private deleteDocumentsUseCase = inject(DeleteDocumentsUseCase);
  private downloadZipUseCase = inject(DownloadZipUseCase);
  private getPresignedUrlUseCase = inject(GetPresignedUrlUseCase);

  nit = this.authService.getNit() || '';
  currentPrefix: string = '';
  searchTerm: string = '';

  documents: StorageDocument[] = [];
  selectedDocuments: Set<StorageDocument> = new Set();
  isLoadingDocuments = false;
  isUploading = false;
  documentsError = '';

  showCreateFolderModal = false;
  newFolderName = '';
  isCreatingFolder = false;

  showDeleteModal = false;
  deleteMessage = '';
  pendingDeleteDocs: StorageDocument[] = [];
  isDeleting = false;
  isDownloading = false;

  currentPage = 1;
  itemsPerPage = 10;

  toastMessage: string | null = null;
  toastType: 'success' | 'warning' | 'error' = 'warning';

  showToast(message: string, type: 'success' | 'warning' | 'error' = 'warning') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 4000);
  }

  ngOnInit(): void {
    if (this.nit) {
      this.loadDocuments();
    }
  }

  get breadcrumbs(): string[] {
    if (!this.currentPrefix) return [];
    return this.currentPrefix.split('/').filter(p => p.length > 0);
  }

  navigateToBreadcrumb(index: number) {
    if (index === -1) {
      this.currentPrefix = '';
    } else {
      const parts = this.currentPrefix.split('/').filter(p => p.length > 0);
      this.currentPrefix = parts.slice(0, index + 1).join('/') + '/';
    }
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadDocuments();
  }

  get filteredDocuments(): StorageDocument[] {
    if (!this.searchTerm.trim()) {
      return this.documents;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.documents.filter(doc => doc.name.toLowerCase().includes(lowerTerm));
  }

  onSearchTermChange(newTerm: string) {
    this.searchTerm = newTerm;
    this.currentPage = 1;
  }

  get paginatedDocuments(): StorageDocument[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDocuments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDocuments.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get currentRangeEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredDocuments.length);
  }

  loadDocuments() {
    this.isLoadingDocuments = true;
    this.documentsError = '';
    this.selectedDocuments.clear();

    this.getDocumentsUseCase.execute(this.nit, this.currentPrefix).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.documents = res;
        } else if (res && Array.isArray(res.data)) {
          this.documents = res.data;
        } else if (res && Array.isArray(res.items)) {
          this.documents = res.items;
        } else {
          this.documents = [];
        }
        this.isLoadingDocuments = false;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
        this.documentsError = 'Error loading documents.';
        this.isLoadingDocuments = false;
      }
    });
  }

  createNewFolder() {
    this.newFolderName = '';
    this.showCreateFolderModal = true;
  }

  closeCreateFolderModal() {
    this.showCreateFolderModal = false;
    this.newFolderName = '';
  }

  confirmCreateFolder() {
    const folderName = this.newFolderName.trim();
    if (!folderName) {
      alert('El nombre de la carpeta no puede estar vacío.');
      return;
    }

    if (!this.nit) {
      alert('Error: No se encontró un NIT válido en la sesión.');
      return;
    }

    this.isCreatingFolder = true;
    const prefix = this.currentPrefix ? this.currentPrefix : '';

    this.createFolderUseCase.execute({
      nit: this.nit,
      folderName: folderName,
      prefix: prefix
    }).subscribe({
      next: () => {
        this.isCreatingFolder = false;
        this.closeCreateFolderModal();
        this.loadDocuments(); 
      },
      error: (err) => {
        this.isCreatingFolder = false;
        console.error('Error creating folder', err);
        alert('Hubo un error al crear la carpeta.');
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!this.nit) {
      alert('Error: No se encontró un NIT válido en la sesión.');
      return;
    }

    const isDuplicate = this.documents.some(doc => doc.name === file.name && this.getFileIcon(doc.name) !== 'folder');
    if (isDuplicate) {
      this.showToast(`El documento "${file.name}" ya existe en esta carpeta. Para actualizarlo, elimínalo primero.`, 'warning');
      event.target.value = '';
      return;
    }

    this.isUploading = true;
    let subfolderPath: string | undefined = undefined;
    if (this.currentPrefix) {
      subfolderPath = this.currentPrefix.endsWith('/') ? this.currentPrefix.slice(0, -1) : this.currentPrefix;
    }

    this.uploadDocumentUseCase.execute(this.nit, file, subfolderPath).subscribe({
      next: () => {
        this.isUploading = false;
        event.target.value = '';
        this.loadDocuments();
      },
      error: (err) => {
        this.isUploading = false;
        event.target.value = '';
        console.error('Error uploading file:', err);
        alert('Hubo un error al subir el archivo.');
      }
    });
  }

  getFileIcon(name: string): string {
    if (!name) return 'article';
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.pdf')) return 'picture_as_pdf';
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) return 'article';
    if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar')) return 'archive';
    if (!lowerName.includes('.')) return 'folder';
    return 'article';
  }

  openDocument(doc: StorageDocument) {
    if (!this.nit) {
      this.showToast('Error: No se encontró un NIT válido en la sesión.', 'error');
      return;
    }

    const s3FolderName = this.authService.getS3FolderName();
    if (!s3FolderName) {
      this.showToast('Error: No se encontró la configuración de almacenamiento.', 'error');
      return;
    }

    const fileKey = doc['key'] ? doc['key'] : `${s3FolderName}/${this.currentPrefix}${doc.name}`;

    this.getPresignedUrlUseCase.execute(this.nit, fileKey).subscribe({
      next: (res) => {
        if (res && res.url) {
          window.open(res.url, '_blank');
        }
      },
      error: (err) => {
        console.error('Error getting presigned URL:', err);
        this.showToast(`Hubo un error al intentar abrir el documento: ${doc.name}`, 'error');
      }
    });
  }

  openDocumentOrFolder(doc: StorageDocument) {
    if (this.getFileIcon(doc.name) === 'folder') {
      this.currentPrefix += doc.name + '/';
      this.loadDocuments();
    } else {
      this.openDocument(doc);
    }
  }

  toggleDocumentSelection(doc: StorageDocument, event: any) {
    if (event.target.checked) {
      this.selectedDocuments.add(doc);
    } else {
      this.selectedDocuments.delete(doc);
    }
  }

  isSelected(doc: StorageDocument): boolean {
    return this.selectedDocuments.has(doc);
  }

  toggleAllSelection(event: any) {
    if (event.target.checked) {
      this.filteredDocuments.forEach(d => this.selectedDocuments.add(d));
    } else {
      this.selectedDocuments.clear();
    }
  }

  get isAllSelected(): boolean {
    return this.filteredDocuments.length > 0 && this.selectedDocuments.size === this.filteredDocuments.length;
  }

  get downloadableDocumentsCount(): number {
    let count = 0;
    this.selectedDocuments.forEach(doc => {
      if (this.getFileIcon(doc.name) !== 'folder') count++;
    });
    return count;
  }

  downloadSelectedDocuments() {
    if (this.selectedDocuments.size === 0) return;
    this.isDownloading = true;
    const docs = Array.from(this.selectedDocuments).filter(doc => this.getFileIcon(doc.name) !== 'folder');
    if (docs.length === 0) {
      this.isDownloading = false;
      return;
    }
    this.triggerZipDownload(docs, 'documentos_seleccionados.zip');
  }

  downloadDocument(doc: StorageDocument) {
    if (this.getFileIcon(doc.name) === 'folder') return;
    this.isDownloading = true;
    this.triggerZipDownload([doc], `${doc.name}`);
  }

  private triggerZipDownload(docs: StorageDocument[], zipFilename: string) {
    if (!this.nit) {
      alert('Error: No se encontró un NIT válido en la sesión.');
      this.isDownloading = false;
      return;
    }

    const s3FolderName = this.authService.getS3FolderName();
    if (!s3FolderName) {
      alert('Error: No se encontró la configuración de almacenamiento.');
      this.isDownloading = false;
      return;
    }

    const fileKeys = docs.map(doc => doc['key'] ? doc['key'] : `${s3FolderName}/${this.currentPrefix}${doc.name}`);

    this.downloadZipUseCase.execute(this.nit, fileKeys).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = docs.length > 1 ? zipFilename : (zipFilename.endsWith('.zip') ? zipFilename : zipFilename + '.zip');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.selectedDocuments.clear();
      },
      error: (err) => {
        console.error('Error in zip download', err);
        this.isDownloading = false;
        alert('Hubo un error al descargar los documentos en ZIP.');
      }
    });
  }

  confirmDeleteSelected() {
    if (this.selectedDocuments.size === 0) return;
    this.pendingDeleteDocs = Array.from(this.selectedDocuments);
    this.deleteMessage = `¿Estás seguro de que deseas eliminar ${this.pendingDeleteDocs.length} elemento(s)? Esta acción no se puede deshacer.`;
    this.showDeleteModal = true;
  }

  deleteSelectedDocuments() {
    this.confirmDeleteSelected();
  }

  confirmDeleteSingle(doc: StorageDocument, event: Event) {
    event.stopPropagation();
    this.pendingDeleteDocs = [doc];
    this.deleteMessage = `¿Estás seguro de que deseas eliminar "${doc.name}"? Esta acción no se puede deshacer.`;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (this.pendingDeleteDocs.length === 0) {
      this.showDeleteModal = false;
      return;
    }

    this.isDeleting = true;

    const s3FolderName = this.authService.getS3FolderName();
    if (!s3FolderName) {
      alert('Error: Configuración de almacenamiento no encontrada.');
      this.isDeleting = false;
      this.showDeleteModal = false;
      return;
    }

    const keysToDelete = this.pendingDeleteDocs.map(doc => {
      if (this.getFileIcon(doc.name) === 'folder') {
        const prefix = this.currentPrefix ? this.currentPrefix : '';
        return `${prefix}${doc.name}`;
      } else {
        return doc['key'] ? doc['key'] : `${s3FolderName}/${this.currentPrefix}${doc.name}`;
      }
    });

    this.deleteDocumentsUseCase.execute(this.nit, keysToDelete).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.selectedDocuments.clear();
        this.pendingDeleteDocs = [];
        this.loadDocuments();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Error deleting documents:', err);
        this.showDeleteModal = false;
        alert('Hubo un error al eliminar los documentos seleccionados.');
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.pendingDeleteDocs = [];
  }
}
