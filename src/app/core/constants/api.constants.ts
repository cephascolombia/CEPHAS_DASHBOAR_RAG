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
};

// =============================================
// Route Paths
// =============================================
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};
