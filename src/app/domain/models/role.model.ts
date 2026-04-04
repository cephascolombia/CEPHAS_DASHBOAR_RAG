export interface Role {
  id: number;
  name: string;
  description: string;
  permissionIds?: number[];
  permissions?: RolePermission[];
}

export interface RolePermission {
  id: number;
  keyCode: string;
  description: string;
  module: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: number[];
}
