import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { GetCompanyConfigUseCase } from '../../../application/use-cases/get-company-config.usecase';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermissionDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private getCompanyConfigUseCase = inject(GetCompanyConfigUseCase);

  isSidebarOpen = false;
  username = this.authService.getUsername() || 'User';
  nit = this.authService.getNit() || '';
  companyName = this.authService.getCompanyName() || `Tenant: ${this.nit}`;

  ngOnInit(): void {
    if (this.nit) {
      this.ensureS3FolderConfig();
    }
  }

  ensureS3FolderConfig() {
    if (!this.authService.getS3FolderName() || !this.authService.getCompanyName()) {
      this.getCompanyConfigUseCase.execute(this.nit).subscribe({
        next: (config) => {
          if (config) {
            if (config.s3FolderName) {
              this.authService.setS3FolderName(config.s3FolderName);
            }
            if (config.companyName) {
              this.authService.setCompanyName(config.companyName);
              this.companyName = config.companyName;
            } else {
              this.companyName = `Tenant: ${this.nit}`;
            }
            if (config.api_key_model) {
              this.authService.setApiKeyModel(config.api_key_model);
            }
            if (config.database) {
              this.authService.setRagDatabase(config.database);
            } else if (config.connectionString) {
              // Extraer el nombre de la base de datos del connectionString si no hay campo explícito
              const dbMatch = config.connectionString.match(/Database=([^;]+)/i);
              if (dbMatch && dbMatch[1]) {
                this.authService.setRagDatabase(dbMatch[1].trim());
              }
            }
          }
        },
        error: (err) => console.error('Error fetching company config', err)
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
