export interface IFileService {
  validateFile(file: { mimetype: string; filename: string }): void;
  bufferToUint8Array(buffer: Buffer): Uint8Array;
}

export interface IFileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IUploadedFile {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}
