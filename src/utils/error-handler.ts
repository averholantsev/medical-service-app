import { FastifyReply } from 'fastify';

export interface ApiError {
  error: string;
  details?: string;
}

export class ErrorHandler {
  static handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof Error) {
      // Handle validation errors
      if (
        error.message.includes('File must be a PDF') ||
        error.message.includes('No PDF file provided') ||
        error.message.includes('Filename is required')
      ) {
        reply.code(400).send({ error: error.message });
        return;
      }

      // Handle PDF parsing errors
      if (
        error.message.includes('Failed to parse PDF') ||
        error.message.includes('Invalid PDF')
      ) {
        reply.code(422).send({
          error: 'Failed to parse PDF',
          details: error.message,
        });
        return;
      }
    }

    // Generic error handler
    reply.code(500).send({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  static createApiError(message: string, details?: string): ApiError {
    return {
      error: message,
      details,
    };
  }
}
