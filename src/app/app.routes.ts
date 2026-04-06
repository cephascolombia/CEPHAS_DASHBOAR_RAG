import { Routes } from '@angular/router';
import { LoginComponent } from './presentation/pages/login/login.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { DocumentsComponent } from './presentation/pages/documents/documents.component';
import { IaChatComponent } from './presentation/pages/ia-chat/ia-chat.component';
import { Unauthorized } from './presentation/pages/unauthorized/unauthorized';
import { SettingsComponent } from './presentation/pages/settings/settings.component';
import { UsersManagementComponent } from './presentation/pages/settings/users/users-management.component';
import { RolesManagementComponent } from './presentation/pages/settings/roles/roles-management.component';
import { authGuard, noAuthGuard, permissionGuard } from './presentation/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'documents', pathMatch: 'full' },
      { 
        path: 'documents', 
        component: DocumentsComponent,
        canActivate: [permissionGuard],
        data: { requiredPermission: 'documents_view' }
      },
      { 
        path: 'ia', 
        component: IaChatComponent,
        canActivate: [permissionGuard],
        data: { requiredPermission: 'ia_view' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [permissionGuard],
        data: { requiredPermission: 'settings_view' },
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          { path: 'users', component: UsersManagementComponent },
          { path: 'roles', component: RolesManagementComponent }
        ]
      },
      {
        path: 'unauthorized',
        component: Unauthorized
      }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
