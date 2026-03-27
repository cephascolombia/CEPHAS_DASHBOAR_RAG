import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginUseCase } from '../../../application/usecases/login.usecase';

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

  nit = '';
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  
  // Validation error messages
  errors = {
    nit: '',
    username: '',
    password: ''
  };

  private validateForm(): boolean {
    let valid = true;
    this.errors = { nit: '', username: '', password: '' };

    // Validate NIT: required, only numbers, minimum 9 digits
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

    // Validate username: required, no spaces, min 3 chars
    if (!this.username.trim()) {
      this.errors.username = 'El usuario es requerido.';
      valid = false;
    } else if (this.username.trim().length < 3) {
      this.errors.username = 'El usuario debe tener al menos 3 caracteres.';
      valid = false;
    } else if (/\s/.test(this.username)) {
      this.errors.username = 'El usuario no puede contener espacios.';
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
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
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
