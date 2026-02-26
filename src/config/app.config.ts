export interface IAppConfig {
  port: number;
  host: string;
  fileSizeLimit: number;
  maxFiles: number;
  llmConfig: ILlmConfig;
}

export interface ILlmConfig {
  routerAiApiKey: string;
  routerAiBaseUrl: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

export const getAppConfig = (): IAppConfig => {
  return {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    fileSizeLimit: parseInt(process.env.FILE_SIZE_LIMIT || '10485760'), // 10MB in bytes
    maxFiles: parseInt(process.env.MAX_FILES || '1'),
    llmConfig: {
      routerAiApiKey: process.env.ROUTERAI_API_KEY || '',
      routerAiBaseUrl: process.env.ROUTERAI_BASE_URL || '',
      defaultModel: 'deepseek/deepseek-v3.1-terminus',
      defaultTemperature: 0.1,
      defaultMaxTokens: 2000,
    },
  };
};
