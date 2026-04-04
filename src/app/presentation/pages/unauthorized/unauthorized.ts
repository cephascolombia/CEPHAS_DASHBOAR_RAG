import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
