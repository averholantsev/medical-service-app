import { IPdfParseResult } from './pdf-parser.interface.js';

export interface ILlmService {
  processPdfText(
    textByPage: string[],
    options?: ILlmProcessOptions,
  ): Promise<ILlmProcessResult>;
}

export interface ILlmProcessOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userPrompt?: string;
}

export interface ILlmProcessResult {
  success: boolean;
  data?: any;
  error?: string;
  modelUsed?: string;
  tokensUsed?: number;
}

export interface IRouterAiChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: 'json_object';
  };
}

export interface IRouterAiChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface IPdfLlmResult extends IPdfParseResult {
  llmAnalysis?: ILlmProcessResult;
}
