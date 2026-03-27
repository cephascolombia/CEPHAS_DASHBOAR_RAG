export interface CompanyConfig {
  connectionString: string;
  s3FolderName: string;
  companyName?: string;
}

export abstract class CompanyRepository {
  abstract getConfig(nit: string): import('rxjs').Observable<CompanyConfig>;
}
