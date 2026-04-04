import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../infrastructure/services/user.service';
import { RoleService } from '../../../infrastructure/services/role.service';
import { DocumentTypeService } from '../../../infrastructure/services/document-type.service';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { UserListItem, CreateUserRequest } from '../../../domain/models/user.model';
import { Role } from '../../../domain/models/role.model';
import { DocumentType } from '../../../domain/models/document-type.model';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private documentTypeService = inject(DocumentTypeService);
  private authService = inject(AuthService);

  get canViewUsers(): boolean { return this.authService.hasPermission('users_view'); }
  get canCreateUser(): boolean { return this.authService.hasPermission('user_create'); }
  get canEditUser(): boolean { return this.authService.hasPermission('user_edit'); }
  get canDeleteUser(): boolean { return this.authService.hasPermission('user_delete'); }

  // State
  users = signal<UserListItem[]>([]);
  roles = signal<Role[]>([]);
  documentTypes = signal<DocumentType[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal<number | null>(null);
  isPanelOpen = signal(false);
  isEditMode = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isPasswordVisible = signal(false);

  togglePasswordVisibility(): void {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  // Confirm delete
  confirmDeleteId: number | null = null;
  confirmDeleteName = '';

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  // Form model
  editingUserId: number | null = null;
  form: CreateUserRequest = this.emptyForm();

  // Validation errors
  formErrors: Record<string, string> = {};

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadDocumentTypes();
  }

  emptyForm(): CreateUserRequest {
    return {
      email: '',
      password: '',
      fullName: '',
      firstName: '',
      middleName: '',
      firstSurname: '',
      secondSurname: '',
      phone: '',
      address: '',
      identityDocument: '',
      rolId: 0,
      documentTypeId: 0,
      cargo: '',
      fechaContratacion: '',
      isActive: true
    };
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.userService.getAll(this.pageNumber, this.pageSize).subscribe({
      next: (res: UserListItem[] | any) => {
        const raw: any[] = Array.isArray(res) ? res : (res.items || res.data || []);
        // Normalize: map 'id' -> 'userId' if API returns 'id'
        const items: UserListItem[] = raw.map(u => ({
          ...u,
          userId: u.userId ?? u.id
        }));
        this.users.set(items);
        this.totalCount = Array.isArray(res) ? items.length : (res.totalCount || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la lista de usuarios.');
        this.isLoading.set(false);
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (roles: Role[]) => this.roles.set(roles),
      error: () => { }
    });
  }

  loadDocumentTypes(): void {
    this.documentTypeService.getAll().subscribe({
      next: (types: DocumentType[]) => this.documentTypes.set(types),
      error: () => { }
    });
  }

  openCreatePanel(): void {
    this.isEditMode.set(false);
    this.editingUserId = null;
    this.form = this.emptyForm();
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isPasswordVisible.set(false);
    this.isPanelOpen.set(true);
  }

  openEditPanel(user: UserListItem): void {
    this.isEditMode.set(true);
    this.editingUserId = user.userId;
    this.form = {
      email: user.email,
      password: '',
      fullName: user.fullName,
      firstName: user.firstName,
      middleName: user.middleName || '',
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname || '',
      phone: user.phone || '',
      address: user.address || '',
      identityDocument: user.identityDocument,
      rolId: user.rolId,
      documentTypeId: user.documentTypeId,
      cargo: user.cargo || '',
      fechaContratacion: user.fechaContratacion ? user.fechaContratacion.substring(0, 10) : '',
      isActive: user.isActive !== undefined ? user.isActive : true
    };
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isPasswordVisible.set(false);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isPasswordVisible.set(false);
  }

  // Delete flow
  requestDelete(userId: number): void {
    const user = this.users().find(u => u.userId === userId);
    this.confirmDeleteId = userId;
    this.confirmDeleteName = user ? (user.fullName || `${user.firstName} ${user.firstSurname}`) : 'este usuario';
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
    this.confirmDeleteName = '';
  }

  confirmDelete(): void {
    if (this.confirmDeleteId === null) return;
    const id = this.confirmDeleteId;
    this.isDeleting.set(id);
    this.userService.delete(id).subscribe({
      next: () => {
        this.isDeleting.set(null);
        this.confirmDeleteId = null;
        this.confirmDeleteName = '';
        this.loadUsers();
      },
      error: (err: any) => {
        this.isDeleting.set(null);
        this.confirmDeleteId = null;
        this.confirmDeleteName = '';
        this.errorMessage.set(err?.error?.message || 'Error al eliminar el usuario.');
      }
    });
  }

  validateForm(): boolean {
    this.formErrors = {};
    let valid = true;

    if (!this.form.email || !this.form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.formErrors['email'] = 'Email válido es requerido';
      valid = false;
    }
    const passValue = this.form.password || '';
    if (!this.isEditMode() && !passValue) {
      this.formErrors['password'] = 'La contraseña es requerida para un nuevo usuario';
      valid = false;
    } else if (passValue) {
      if (passValue.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passValue)) {
        this.formErrors['password'] = 'La contraseña debe tener mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número';
        valid = false;
      }
    }
    if (!this.form.firstName || this.form.firstName.trim().length < 2) {
      this.formErrors['firstName'] = 'Primer nombre es requerido';
      valid = false;
    }
    if (!this.form.firstSurname || this.form.firstSurname.trim().length < 2) {
      this.formErrors['firstSurname'] = 'Primer apellido es requerido';
      valid = false;
    }
    if (!this.form.secondSurname || this.form.secondSurname.trim().length < 2) {
      this.formErrors['secondSurname'] = 'Segundo apellido es requerido';
      valid = false;
    }
    if (!this.form.identityDocument || this.form.identityDocument.trim().length < 4) {
      this.formErrors['identityDocument'] = 'Documento de identidad es requerido';
      valid = false;
    }
    if (!this.form.rolId || this.form.rolId === 0) {
      this.formErrors['rolId'] = 'Debe seleccionar un rol';
      valid = false;
    }
    if (!this.form.documentTypeId || this.form.documentTypeId === 0) {
      this.formErrors['documentTypeId'] = 'Debe seleccionar un tipo de documento';
      valid = false;
    }
    if (!this.form.phone || this.form.phone.trim().length === 0) {
      this.formErrors['phone'] = 'El teléfono es requerido';
      valid = false;
    } else if (!/^\d{7,15}$/.test(this.form.phone.trim())) {
      this.formErrors['phone'] = 'Ingresa un teléfono válido (solo dígitos, 7–15 caracteres)';
      valid = false;
    }

    return valid;
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const capitalize = (str: string | undefined): string => {
      if (!str) return '';
      const trimmed = str.trim();
      if (!trimmed) return '';
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    };

    this.form.firstName = capitalize(this.form.firstName);
    this.form.middleName = capitalize(this.form.middleName);
    this.form.firstSurname = capitalize(this.form.firstSurname);
    this.form.secondSurname = capitalize(this.form.secondSurname);

    // Build fullName from all name parts (not shown in form)
    const parts = [
      this.form.firstName,
      this.form.middleName,
      this.form.firstSurname,
      this.form.secondSurname
    ].filter(p => p && p.trim().length > 0);
    this.form.fullName = parts.join(' ').trim();

    const payload: any = { ...this.form };
    if (this.isEditMode() && !payload.password) {
      delete payload.password;
    }
    if (payload.fechaContratacion) {
      payload.fechaContratacion = new Date(payload.fechaContratacion).toISOString();
    }

    if (this.isEditMode() && this.editingUserId !== null) {
      this.userService.update(this.editingUserId, payload).subscribe({
        next: () => {
          this.successMessage.set('Usuario actualizado correctamente.');
          this.isSaving.set(false);
          this.loadUsers();
          setTimeout(() => this.closePanel(), 1200);
        },
        error: (err: any) => {
          this.errorMessage.set(err?.error?.message || 'Error al actualizar usuario.');
          this.isSaving.set(false);
        }
      });
    } else {
      this.userService.create(payload).subscribe({
        next: () => {
          this.successMessage.set('Usuario creado correctamente.');
          this.isSaving.set(false);
          this.loadUsers();
          setTimeout(() => this.closePanel(), 1200);
        },
        error: (err: any) => {
          this.errorMessage.set(err?.error?.message || 'Error al crear usuario.');
          this.isSaving.set(false);
        }
      });
    }
  }

  getRoleName(rolId: number): string {
    const role = this.roles().find(r => r.id === rolId);
    return role?.name || `Rol #${rolId}`;
  }

  getDocTypeName(dtId: number): string {
    const dt = this.documentTypes().find(d => d.id === dtId);
    return dt?.name || `Tipo #${dtId}`;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadUsers();
    }
  }

  trackById(_index: number, item: UserListItem): number {
    return item.userId;
  }
}
