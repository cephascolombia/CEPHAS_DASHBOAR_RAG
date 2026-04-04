export interface Permission {
  id: number;
  systemName: string;
  description: string;
}

export interface CreatePermissionRequest {
  systemName: string;
  description: string;
}
