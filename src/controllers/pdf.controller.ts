import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../services/file.service.js';
import { PdfParserService } from '../services/pdf-parser.service.js';

export class PdfController {
  constructor(
    private readonly fileService: FileService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  async parsePdf(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.parts) {
        return reply.code(400).send({ error: 'Multipart form data required' });
      }

      const parts = request.parts();
      const uploadedFile = await this.fileService.processUploadedFile(parts);

      const parseResult = await this.pdfParserService.parsePdf(
        uploadedFile.buffer,
      );

      return {
        filename: uploadedFile.filename,
        mimetype: uploadedFile.mimetype,
        pageCount: parseResult.pageCount,
        textByPage: parseResult.textByPage,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('File must be a PDF') ||
          error.message.includes('No PDF file provided')
        ) {
          return reply.code(400).send({ error: error.message });
        }
      }

      request.log.error(error);
      return reply.code(500).send({
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
