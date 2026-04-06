export interface LoginRequest {
  nit: string;
  email: string;
  password: string;
}

export interface User {
  userId: number;
  email: string;
  roleName: string;
  permissions: string[];
  companyName: string;
  companyNit: string;
  token: string;
}

/** Respuesta del GET /api/v1.0/user - representa un usuario en el listado */
export interface UserListItem {
  userId: number;
  email: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  firstSurname: string;
  secondSurname?: string;
  phone?: string;
  address?: string;
  identityDocument: string;
  rolId: number;
  roleName?: string;
  documentTypeId: number;
  documentTypeName?: string;
  cargo?: string;
  fechaContratacion?: string;
  companyNit?: string;
  isActive?: boolean;
}

/** Body para POST /api/v1.0/user y PUT /api/v1.0/user/{id} */
export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  firstSurname: string;
  secondSurname?: string;
  phone?: string;
  address?: string;
  identityDocument: string;
  rolId: number;
  documentTypeId: number;
  cargo?: string;
  fechaContratacion?: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface UserListResponse {
  items: UserListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
