import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, User } from '../../domain/models/user.model';
import { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(request: LoginRequest): Observable<User> {
    return this.authRepository.login(request);
  }
}
