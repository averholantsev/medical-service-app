import {
  ILlmService,
  ILlmProcessOptions,
  ILlmProcessResult,
  IRouterAiChatRequest,
  IRouterAiChatResponse,
} from '../interfaces/llm-service.interface.js';
import { ILlmConfig } from '../config/app.config.js';

export class LlmService implements ILlmService {
  private readonly config: ILlmConfig;

  constructor(config: ILlmConfig) {
    this.config = config;

    if (!this.config.routerAiApiKey) {
      throw new Error(
        'RouterAI API key is required. Set ROUTERAI_API_KEY environment variable.',
      );
    }
  }

  async processPdfText(
    textByPage: string[],
    options: ILlmProcessOptions = {},
  ): Promise<ILlmProcessResult> {
    try {
      const combinedText = this.combinePages(textByPage);
      const systemPrompt =
        options.systemPrompt || this.getDefaultSystemPrompt();
      const userPrompt =
        options.userPrompt || this.getDefaultUserPrompt(combinedText);

      const request: IRouterAiChatRequest = {
        model: options.model || this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: options.temperature ?? this.config.defaultTemperature,
        max_tokens: options.maxTokens ?? this.config.defaultMaxTokens,
        response_format: {
          type: 'json_object',
        },
      };

      const response = await this.makeApiCall(request);

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from LLM');
      }

      const content = response.choices[0].message.content;
      const parsedData = this.parseJsonResponse(content);

      return {
        success: true,
        data: parsedData,
        modelUsed: response.model,
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private combinePages(textByPage: string[]): string {
    return textByPage
      .map((text, index) => `--- Страница ${index + 1} ---\n${text}`)
      .join('\n\n');
  }

  private getDefaultSystemPrompt(): string {
    return `Ты - AI ассистент для анализа медицинских документов. 
Проанализируй предоставленный текст из PDF документа и верни структурированный JSON ответ с числовыми значениями показателей.

Требования к ответу:
- Ответ должен быть строго в формате JSON
- Используй только валидный JSON синтаксис
- Не добавляй никаких пояснений или комментариев вне JSON структуры
- Извлекай только числовые значения показателей из текста
- Если значение отсутствует, используй null
- Показатели перечислены в столбце слева
- Числовые значения находятся в столбце справа от названий
- Между названием показателя и его значением может быть несколько столбцов
- Ищи значения после названий показателей в тексте

Структура ответа должна включать:
- metadata: метаданные анализа
- metadata.patientName: ФИО пациента
- metadata.age: возраст пациента
- metadata.gender: пол пациента (мужской | женский)
- metadata.collectionDate: дата сдачи показателей
- indicators: объект с числовыми значениями показателей, словарь соответствий ниже

Правила извлечения числовых значений:
- Десятичный разделитель - точка (.)
- Разделитель тысяч не используется
- Сохраняй точность исходных значений
- Не добавляй и не удаляй нули

Словарь соответствий показателей для JSON (используй английские алиасы):
{
  "СОЭ": "ESR",
  "Эритроциты": "RBC", 
  "Гемоглобин": "HGB",
  "Гематокрит": "HCT",
  "Средний объем эритроцитов (MCV)": "MCV",
  "Средняя концентрация Hb в эритроцитах (МСНС)": "MCHC",
  "Среднее содержание гемоглобина в эритроците (МСН)": "MCH",
  "Отн.ширина распред.эритр.по объему (ст.отклонение)": "RDW_SD",
  "Отн.ширина распред.эритр.по объему(коэфф.вариации)": "RDW_CV",
  "Тромбоциты": "PLT",
  "Средний объем тромбоцитов (MPV)": "MPV",
  "Тромбокрит (PCT)": "PCT",
  "Относит.ширина распред.тромбоцитов по объему (PDW)": "PDW",
  "Лейкоциты": "WBC",
  "Нейтрофилы": "NEUT",
  "Нейтрофилы %": "NEUT_PERCENT",
  "Эозинофилы": "EOS", 
  "Эозинофилы %": "EOS_PERCENT",
  "Базофилы": "BAS",
  "Базофилы %": "BAS_PERCENT",
  "Моноциты": "MONO",
  "Моноциты %": "MONO_PERCENT",
  "Лимфоциты": "LYMPH",
  "Лимфоциты %": "LYMPH_PERCENT"
}

Пример ожидаемого JSON ответа:
{
  "metadata": {
    "patientName": "Верхоланцев Артем Дмитриевич",
    "age": 33,
    "gender": "мужской",
    "collectionDate": "19.12.2025"
  },
  "indicators": {
    "ESR": 2.0,
    "RBC": 5.23,
    "HGB": 145.0,
    "HCT": 44.1,
    "MCV": 84.3,
    "MCHC": 32.9,
    "MCH": 27.7,
    "RDW_SD": 36.9,
    "RDW_CV": 12.0,
    "PLT": 244.0,
    "MPV": 9.7,
    "PCT": 0.24,
    "PDW": 10.7,
    "WBC": 7.56,
    "NEUT": 3.97,
    "NEUT_PERCENT": 52.5,
    "EOS": 0.35,
    "EOS_PERCENT": 4.6,
    "BAS": 0.02,
    "BAS_PERCENT": 0.3,
    "MONO": 0.87,
    "MONO_PERCENT": 11.5,
    "LYMPH": 2.35,
    "LYMPH_PERCENT": 31.1
  }
}`;
  }

  private getDefaultUserPrompt(text: string): string {
    return `Проанализируй следующий текст из медицинского документа:

${text}

Верни структурированный JSON ответ согласно требованиям выше.`;
  }

  private async makeApiCall(
    request: IRouterAiChatRequest,
  ): Promise<IRouterAiChatResponse> {
    const response = await fetch(
      `${this.config.routerAiBaseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.routerAiApiKey}`,
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RouterAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data as IRouterAiChatResponse;
  }

  private parseJsonResponse(content: string): any {
    try {
      // Убираем возможные markdown блоки кода
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
  }
}
