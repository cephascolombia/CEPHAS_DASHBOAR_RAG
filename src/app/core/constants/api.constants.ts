// =============================================
// API Endpoints
// =============================================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1.0/auth/login',
  },
  COMPANY: {
    CONFIG: (nit: string) => `/api/v1/company/config/${nit}`,
  },
  STORAGE: {
    LIST: (nit: string, prefix?: string) => {
      let url = `/api/v1.0/storage/list?nit=${nit}`;
      if (prefix) {
        url += `&prefix=${prefix}`;
      }
      return url;
    },
    CREATE_FOLDER: '/api/v1.0/storage/folder',
    UPLOAD: '/api/v1.0/storage/upload',
    DELETE: '/api/v1.0/storage/delete',
    PRESIGNED_URL: (nit: string, fileKey: string) => `/api/v1.0/storage/presigned-url?nit=${nit}&fileKey=${encodeURIComponent(fileKey)}`,
    DOWNLOAD_ZIP: '/api/v1/storage/download-zip',
  },
  USERS: {
    GET_ALL: (pageNumber: number, pageSize: number) => `/api/v1.0/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    GET_BY_ID: (id: number) => `/api/v1.0/user/${id}`,
    CREATE: '/api/v1.0/user',
    UPDATE: (id: number) => `/api/v1.0/user/${id}`,
    DELETE: (id: number) => `/api/v1.0/user/${id}`,
  },
  ROLES: {
    GET_ALL: '/api/v1.0/Role',
    GET_BY_ID: (id: number) => `/api/v1.0/Role/${id}`,
    CREATE: '/api/v1.0/Role',
    UPDATE: (id: number) => `/api/v1.0/Role/${id}`,
    DELETE: (id: number) => `/api/v1.0/Role/${id}`,
  },
  PERMISSIONS: {
    GET_ALL: (nit: string) => `/api/v1.0/permissions?nit=${nit}`,
    GET_BY_ID: (nit: string, id: number) => `/api/v1.0/permissions/${id}?nit=${nit}`,
    CREATE: '/api/v1.0/permissions',
    UPDATE: (id: number) => `/api/v1.0/permissions/${id}`,
    DELETE: (nit: string, id: number) => `/api/v1.0/permissions/${id}?nit=${nit}`,
  },
  DOCUMENT_TYPES: {
    GET_ALL: '/api/v1.0/document-types',
  },
  PERMIT: {
    GET_ALL: '/api/v1.0/Permit',
  }
};


// =============================================
// LocalStorage Keys
// =============================================
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  NIT: 'auth_nit',
  USERNAME: 'auth_username',
  S3_FOLDER_NAME: 's3_folder_name',
  COMPANY_NAME: 'company_name',
  RAG_DATABASE: 'rag_database',
  API_KEY_MODEL: 'api_key_model',
  PERMISSIONS: 'auth_permissions',
};

// =============================================
// Route Paths
// =============================================
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};
