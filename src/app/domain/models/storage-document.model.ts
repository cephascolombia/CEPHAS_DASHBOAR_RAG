export interface StorageDocument {
  id?: string;
  name: string;
  status?: string;
  size?: number | string;
  modifiedAt?: string | Date;
  [key: string]: any;
}
