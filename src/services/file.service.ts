import {
  IFileService,
  IUploadedFile,
} from '../interfaces/file-service.interface.js';

export class FileService implements IFileService {
  private readonly allowedMimeTypes = ['application/pdf'];

  validateFile(file: { mimetype: string; filename: string }): void {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('File must be a PDF');
    }

    if (!file.filename) {
      throw new Error('Filename is required');
    }
  }

  bufferToUint8Array(buffer: Buffer): Uint8Array {
    return new Uint8Array(buffer);
  }

  async processUploadedFile(parts: AsyncIterable<any>): Promise<IUploadedFile> {
    for await (const part of parts) {
      if (part.type === 'file' && part.filename) {
        this.validateFile(part);

        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }

        return {
          buffer: Buffer.concat(chunks),
          filename: part.filename,
          mimetype: part.mimetype,
        };
      }
    }

    throw new Error('No PDF file provided');
  }
}
