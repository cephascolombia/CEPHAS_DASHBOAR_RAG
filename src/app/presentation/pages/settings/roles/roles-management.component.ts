import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../../infrastructure/services/role.service';
import { PermitService } from '../../../../infrastructure/services/permit.service';
import { Role, CreateRoleRequest } from '../../../../domain/models/role.model';
import { Permit } from '../../../../domain/models/permit.model';
import { AuthService } from '../../../../infrastructure/services/auth.service';

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-management.component.html',
  styleUrl: './roles-management.component.css'
})
export class RolesManagementComponent implements OnInit {
  private roleService = inject(RoleService);
  private permitService = inject(PermitService);
  private authService = inject(AuthService);

  get canViewRoles(): boolean { return this.authService.hasPermission('roles_view'); }
  get canCreateRole(): boolean { return this.authService.hasPermission('role_create'); }
  get canEditRole(): boolean { return this.authService.hasPermission('role_edit'); }
  get canDeleteRole(): boolean { return this.authService.hasPermission('role_delete'); }

  // State
  roles = signal<Role[]>([]);
  permits = signal<Permit[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal<number | null>(null);
  isPanelOpen = signal(false);
  isEditMode = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Confirm delete
  confirmDeleteId: number | null = null;

  // Form model
  editingRoleId: number | null = null;
  formName = '';
  formDescription = '';
  selectedPermissionIds = new Set<number>();
  formErrors: Record<string, string> = {};

  // Group permits by module
  get permitsByModule(): Record<string, Permit[]> {
    const grouped: Record<string, Permit[]> = {};
    for (const p of this.permits()) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }
    return grouped;
  }

  get moduleKeys(): string[] {
    return Object.keys(this.permitsByModule);
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermits();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.roleService.getAll().subscribe({
      next: (roles: Role[]) => {
        this.roles.set(roles);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la lista de roles.');
        this.isLoading.set(false);
      }
    });
  }

  loadPermits(): void {
    this.permitService.getAll().subscribe({
      next: (permits: Permit[]) => this.permits.set(permits),
      error: () => { }
    });
  }

  openCreatePanel(): void {
    this.isEditMode.set(false);
    this.editingRoleId = null;
    this.formName = '';
    this.formDescription = '';
    this.selectedPermissionIds = new Set<number>();
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isPanelOpen.set(true);
  }

  openEditPanel(role: Role): void {
    this.isEditMode.set(true);
    this.editingRoleId = role.id;
    this.formName = role.name;
    this.formDescription = role.description;
    this.selectedPermissionIds = new Set<number>(role.permissionIds || []);
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set('');
    this.confirmDeleteId = null;
  }

  togglePermission(permitId: number): void {
    if (this.selectedPermissionIds.has(permitId)) {
      this.selectedPermissionIds.delete(permitId);
    } else {
      this.selectedPermissionIds.add(permitId);
    }
  }

  isPermissionSelected(permitId: number): boolean {
    return this.selectedPermissionIds.has(permitId);
  }

  toggleModulePermissions(moduleName: string): void {
    const modulePermits = this.permitsByModule[moduleName] || [];
    const allSelected = modulePermits.every(p => this.selectedPermissionIds.has(p.id));
    if (allSelected) {
      modulePermits.forEach(p => this.selectedPermissionIds.delete(p.id));
    } else {
      modulePermits.forEach(p => this.selectedPermissionIds.add(p.id));
    }
  }

  isModuleFullySelected(moduleName: string): boolean {
    const modulePermits = this.permitsByModule[moduleName] || [];
    return modulePermits.length > 0 && modulePermits.every(p => this.selectedPermissionIds.has(p.id));
  }

  isModulePartiallySelected(moduleName: string): boolean {
    const modulePermits = this.permitsByModule[moduleName] || [];
    return modulePermits.some(p => this.selectedPermissionIds.has(p.id)) && !this.isModuleFullySelected(moduleName);
  }

  validateForm(): boolean {
    this.formErrors = {};
    let valid = true;
    if (!this.formName || this.formName.trim().length < 2) {
      this.formErrors['name'] = 'El nombre del rol es requerido (mínimo 2 caracteres)';
      valid = false;
    }
    if (!this.formDescription || this.formDescription.trim().length < 5) {
      this.formErrors['description'] = 'La descripción es requerida';
      valid = false;
    }
    return valid;
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload: CreateRoleRequest = {
      name: this.formName.trim().toUpperCase(),
      description: this.formDescription.trim(),
      permissionIds: Array.from(this.selectedPermissionIds)
    };

    if (this.isEditMode() && this.editingRoleId !== null) {
      this.roleService.update(this.editingRoleId, payload).subscribe({
        next: () => {
          this.successMessage.set('Rol actualizado correctamente.');
          this.isSaving.set(false);
          this.loadRoles();
          setTimeout(() => this.closePanel(), 1200);
        },
        error: (err: any) => {
          this.errorMessage.set(err?.error?.message || 'Error al actualizar el rol.');
          this.isSaving.set(false);
        }
      });
    } else {
      this.roleService.create(payload).subscribe({
        next: () => {
          this.successMessage.set('Rol creado correctamente.');
          this.isSaving.set(false);
          this.loadRoles();
          setTimeout(() => this.closePanel(), 1200);
        },
        error: (err: any) => {
          this.errorMessage.set(err?.error?.message || 'Error al crear el rol.');
          this.isSaving.set(false);
        }
      });
    }
  }

  requestDelete(roleId: number): void {
    this.confirmDeleteId = roleId;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(roleId: number): void {
    this.isDeleting.set(roleId);
    this.roleService.delete(roleId).subscribe({
      next: () => {
        this.isDeleting.set(null);
        this.confirmDeleteId = null;
        this.loadRoles();
      },
      error: (err: any) => {
        this.isDeleting.set(null);
        this.confirmDeleteId = null;
        this.errorMessage.set(err?.error?.message || 'Error al eliminar el rol.');
      }
    });
  }

  getModuleIcon(module: string): string {
    const icons: Record<string, string> = {
      'documents': 'folder',
      'ia': 'smart_toy',
      'settings': 'settings',
    };
    return icons[module] || 'lock';
  }

  getModuleLabel(module: string): string {
    const labels: Record<string, string> = {
      'documents': 'Documentos',
      'ia': 'Inteligencia Artificial',
      'settings': 'Configuración',
    };
    return labels[module] || module;
  }

  countSelected(): number {
    return this.selectedPermissionIds.size;
  }

  trackById(_i: number, item: Role): number {
    return item.id;
  }
}
