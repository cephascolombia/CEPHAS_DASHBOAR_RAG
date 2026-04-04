import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginUseCase } from '../../../application/usecases/login.usecase';
import { AuthService } from '../../../infrastructure/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private loginUseCase = inject(LoginUseCase);
  private authService = inject(AuthService);

  nit = '';
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  isPasswordVisible = false;
  
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  
  // Validation error messages
  errors = {
    nit: '',
    email: '',
    password: ''
  };

  private validateForm(): boolean {
    let valid = true;
    this.errors = { nit: '', email: '', password: '' };

    // Validate NIT: required, only numbers, minimum 6 digits
    if (!this.nit.trim()) {
      this.errors.nit = 'El NIT es requerido.';
      valid = false;
    } else if (!/^\d+$/.test(this.nit.trim())) {
      this.errors.nit = 'El NIT solo debe contener números.';
      valid = false;
    } else if (this.nit.trim().length < 6) {
      this.errors.nit = 'El NIT debe tener al menos 6 dígitos.';
      valid = false;
    }

    // Validate email: required, valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim()) {
      this.errors.email = 'El correo electrónico es requerido.';
      valid = false;
    } else if (!emailRegex.test(this.email.trim())) {
      this.errors.email = 'Debe ser un correo electrónico válido.';
      valid = false;
    }

    // Validate password: required, min 4 chars
    if (!this.password) {
      this.errors.password = 'La contraseña es requerida.';
      valid = false;
    } else if (this.password.length < 4) {
      this.errors.password = 'La contraseña debe tener al menos 4 caracteres.';
      valid = false;
    }

    return valid;
  }

  login() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.loginUseCase.execute({
      nit: this.nit.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        
        // Block empty permissions array to prevent loop/unauthorized access
        const permissions = this.authService.getPermissions();
        if (!permissions || permissions.length === 0) {
          this.authService.logout();
          this.errorMessage = 'Tu usuario no tiene ningún permiso o vista asignada. Contacta al administrador para que te asigne permisos.';
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Verifica tu NIT, usuario y contraseña.';
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          this.errorMessage = `Error del servidor (${err.status}). Intenta más tarde.`;
        }
        console.error('Login failed', err);
      }
    });
  }
}
