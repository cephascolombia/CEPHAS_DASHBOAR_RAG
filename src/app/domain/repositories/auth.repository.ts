import { Observable } from 'rxjs';
import { LoginRequest, User } from '../models/user.model';

export abstract class AuthRepository {
  abstract login(request: LoginRequest): Observable<User>;
}
