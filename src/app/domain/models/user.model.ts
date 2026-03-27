export interface LoginRequest {
  nit: string;
  username: string;
  password: string;
}

export interface User {
  id?: string;
  nit: string;
  username: string;
  token: string;
}
