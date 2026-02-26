import fastify from 'fastify';
import multipart from '@fastify/multipart';
import { IAppConfig, getAppConfig } from './app.config.js';

export const createFastifyInstance = (config: IAppConfig) => {
  const fastifyClient = fastify({ logger: true });

  // Register multipart plugin with configurable limits
  fastifyClient.register(multipart, {
    limits: {
      fileSize: config.fileSizeLimit,
      files: config.maxFiles,
    },
  });

  return fastifyClient;
};

export const createServer = () => {
  const config = getAppConfig();
  return createFastifyInstance(config);
};
