import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../services/file.service.js';
import { PdfParserService } from '../services/pdf-parser.service.js';
import { LlmService } from '../services/llm.service.js';
import { IPdfLlmResult } from '../interfaces/llm-service.interface.js';

export class PdfLlmController {
  constructor(
    private readonly fileService: FileService,
    private readonly pdfParserService: PdfParserService,
    private readonly llmService: LlmService,
  ) {}

  async parsePdfWithLlm(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.parts) {
        return reply.code(400).send({ error: 'Multipart form data required' });
      }

      const parts = request.parts();
      const uploadedFile = await this.fileService.processUploadedFile(parts);

      // Парсим PDF
      const parseResult = await this.pdfParserService.parsePdf(
        uploadedFile.buffer,
      );

      // Обрабатываем текст через LLM
      const llmResult = await this.llmService.processPdfText(
        parseResult.textByPage,
        this.getLlmOptions(request),
      );

      // Формируем итоговый результат
      const result: IPdfLlmResult = {
        filename: uploadedFile.filename,
        mimetype: uploadedFile.mimetype,
        pageCount: parseResult.pageCount,
        textByPage: parseResult.textByPage,
        llmAnalysis: llmResult,
      };

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('File must be a PDF') ||
          error.message.includes('No PDF file provided')
        ) {
          return reply.code(400).send({ error: error.message });
        }

        if (error.message.includes('RouterAI API')) {
          return reply.code(502).send({
            error: 'LLM service unavailable',
            details: error.message,
          });
        }
      }

      request.log.error(error);
      return reply.code(500).send({
        error: 'Failed to process PDF with LLM',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private getLlmOptions(request: FastifyRequest) {
    const query = request.query as any;
    return {
      model: query.model,
      temperature: query.temperature
        ? parseFloat(query.temperature)
        : undefined,
      maxTokens: query.maxTokens ? parseInt(query.maxTokens) : undefined,
      systemPrompt: query.systemPrompt,
      userPrompt: query.userPrompt,
    };
  }
}
