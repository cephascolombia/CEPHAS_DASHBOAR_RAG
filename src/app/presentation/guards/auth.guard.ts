import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../infrastructure/services/auth.service';

/**
 * Auth Guard: Protege rutas que requieren autenticación.
 * Si el usuario NO está autenticado, redirige al login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * No-Auth Guard: Evita que un usuario ya autenticado acceda al login.
 * Si el usuario YA está autenticado, redirige al dashboard.
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Permission Guard: Evita que un usuario acceda a rutas para las cuales no tiene permiso.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtiene el permiso que requiere esta ruta, definido en `data`
  const requiredPermission = route.data?.['requiredPermission'];

  if (!requiredPermission) {
    return true;
  }

  // Si el permiso interno coincide
  if (authService.hasPermission(requiredPermission)) {
    return true;
  }

  console.warn(`Acceso denegado a la ruta por falta de permiso: ${requiredPermission}`);
  
  // Para prevenir bucle infinito con noAuthGuard: 
  // Si el usuario no tiene NINGÚN permiso en absoluto (sesión antigua o sin configurar), cerramos sesión.
  const permissions = authService.getPermissions() || [];
  if (permissions.length === 0) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  // Si tiene permisos pero intentó acceder a una URL a la que no tiene derecho,
  // buscamos a dónde enviarlo válidamente.
  if (permissions.includes('documents_view')) {
    router.navigate(['/dashboard/documents']);
  } else if (permissions.includes('ia_view')) {
    router.navigate(['/dashboard/ia']);
  } else {
    // Si no tiene acceso a las vistas principales pero sí tiene sesión válida.
    router.navigate(['/dashboard/unauthorized']);
  }
  
  return false;
};
