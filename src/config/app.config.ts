export interface IAppConfig {
  port: number;
  host: string;
  fileSizeLimit: number;
  maxFiles: number;
  apiKey: string;
}

export const getAppConfig = (): IAppConfig => {
  return {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    fileSizeLimit: parseInt(process.env.FILE_SIZE_LIMIT || '10485760'), // 10MB in bytes
    maxFiles: parseInt(process.env.MAX_FILES || '1'),
    apiKey: process.env.API_KEY || '',
  };
};
