import * as pdf from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  IPdfParserService,
  IPdfParseResult,
} from '../interfaces/pdf-parser.interface.js';
import { IFileService } from '../interfaces/file-service.interface.js';

export class PdfParserService implements IPdfParserService {
  constructor(private readonly fileService: IFileService) {}

  async parsePdf(buffer: Buffer): Promise<IPdfParseResult> {
    const pdfUint8Array = this.fileService.bufferToUint8Array(buffer);
    const loadingTask = pdf.getDocument({ data: pdfUint8Array });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    const textContent: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const text = await page.getTextContent();
      const pageText = text.items.map((item: any) => item.str).join(' ');
      textContent.push(pageText);
    }

    return {
      filename: '', // Will be filled by controller
      mimetype: 'application/pdf',
      pageCount: numPages,
      textByPage: textContent,
    };
  }
}
