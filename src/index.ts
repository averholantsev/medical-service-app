import { createServer } from './config/fastify.config.js';
import { HealthController } from './controllers/health.controller.js';
import { PdfController } from './controllers/pdf.controller.js';
import { FileService } from './services/file.service.js';
import { PdfParserService } from './services/pdf-parser.service.js';

// Initialize services with dependency injection
const fileService = new FileService();
const pdfParserService = new PdfParserService(fileService);

// Initialize controllers
const healthController = new HealthController();
const pdfController = new PdfController(fileService, pdfParserService);

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

// Run the server
const start = async () => {
  try {
    const config = await import('./config/app.config.js');
    const appConfig = config.getAppConfig();

    await fastifyClient.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    fastifyClient.log.info(
      `Server listening on ${appConfig.host}:${appConfig.port}`,
    );
  } catch (err) {
    fastifyClient.log.error(err);
    process.exit(1);
  }
};

start();
