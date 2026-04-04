import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../infrastructure/services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  private hasView = false;

  @Input() set appHasPermission(permission: string | string[]) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    
    // Check if the user has ALL required permissions (or ANY, depending on requirement. Here we do ANY for flexibility, or ALL).
    // Usually it's better to verify if user has ANY of the passed permissions to show the element.
    const hasAccess = requiredPermissions.some(perm => this.authService.hasPermission(perm));

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
