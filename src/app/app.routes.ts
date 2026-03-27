import { Routes } from '@angular/router';
import { LoginComponent } from './presentation/pages/login/login.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { DocumentsComponent } from './presentation/pages/documents/documents.component';
import { IaChatComponent } from './presentation/pages/ia-chat/ia-chat.component';
import { authGuard, noAuthGuard } from './presentation/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'documents', pathMatch: 'full' },
            { path: 'documents', component: DocumentsComponent },
            { path: 'ia', component: IaChatComponent }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
