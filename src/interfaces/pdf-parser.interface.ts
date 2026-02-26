export interface IPdfParserService {
  parsePdf(buffer: Buffer): Promise<IPdfParseResult>;
}

export interface IPdfParseResult {
  filename: string;
  mimetype: string;
  pageCount: number;
  textByPage: string[];
}

export interface IPdfPage {
  pageNumber: number;
  text: string;
}
