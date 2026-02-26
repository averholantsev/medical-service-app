import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import { createServer } from './config/fastify.config.js';
import { HealthController } from './controllers/health.controller.js';
import { PdfController } from './controllers/pdf.controller.js';
import { PdfLlmController } from './controllers/pdf-llm.controller.js';
import { FileService } from './services/file.service.js';
import { PdfParserService } from './services/pdf-parser.service.js';
import { LlmService } from './services/llm.service.js';

// Initialize services and controllers
const initializeApp = async () => {
  // Load configuration
  const config = await import('./config/app.config.js');
  const appConfig = config.getAppConfig();

  // Initialize services with dependency injection
  const fileService = new FileService();
  const pdfParserService = new PdfParserService(fileService);
  const llmService = new LlmService(appConfig.llmConfig);

  // Initialize controllers
  const healthController = new HealthController();
  const pdfController = new PdfController(fileService, pdfParserService);
  const pdfLlmController = new PdfLlmController(
    fileService,
    pdfParserService,
    llmService,
  );

  // Create Fastify instance
  const fastifyClient = createServer();

  // Register routes
  fastifyClient.get(
    '/api/health',
    healthController.healthCheck.bind(healthController),
  );
  fastifyClient.post(
    '/api/parse-pdf',
    pdfController.parsePdf.bind(pdfController),
  );
  fastifyClient.post(
    '/api/parse-pdf-with-llm',
    pdfLlmController.parsePdfWithLlm.bind(pdfLlmController),
  );

  return { fastifyClient, appConfig };
};

// Run the server
const start = async () => {
  try {
    const { fastifyClient, appConfig } = await initializeApp();

    await fastifyClient.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    fastifyClient.log.info(
      `Server listening on ${appConfig.host}:${appConfig.port}`,
    );
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
