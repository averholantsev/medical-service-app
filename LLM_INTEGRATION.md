# Интеграция LLM с PDF парсером

## Обзор

Добавлена интеграция с RouterAI API для анализа текста из PDF документов с помощью языковых моделей.

## Новые эндпоинты

### POST /api/parse-pdf-with-llm

Анализирует PDF документ и возвращает результат с LLM анализом.

#### Параметры запроса

- **Файл**: PDF документ (multipart/form-data)
- **Query параметры (опционально)**:
  - `model` - модель LLM (по умолчанию: gpt-4o)
  - `temperature` - креативность ответа (0.0-1.0)
  - `maxTokens` - максимальное количество токенов
  - `systemPrompt` - кастомный системный промпт
  - `userPrompt` - кастомный пользовательский промпт

#### Пример запроса

```bash
curl -X POST http://localhost:3000/api/parse-pdf-with-llm \
  -F "file=@document.pdf" \
  -F "model=gpt-4o" \
  -F "temperature=0.1"
```

#### Пример ответа

```json
{
  "filename": "document.pdf",
  "mimetype": "application/pdf",
  "pageCount": 5,
  "textByPage": ["Текст страницы 1...", "Текст страницы 2..."],
  "llmAnalysis": {
    "success": true,
    "data": {
      "summary": "Краткое содержание документа",
      "keyPoints": ["Пункт 1", "Пункт 2"],
      "recommendations": ["Рекомендация 1"],
      "metadata": {
        "documentType": "медицинский",
        "urgency": "средняя"
      }
    },
    "modelUsed": "gpt-4o",
    "tokensUsed": 1500
  }
}
```

## Настройка окружения

Добавьте в файл `.env.local`:

```env
ROUTERAI_API_KEY=your_routerai_api_key_here
ROUTERAI_BASE_URL=https://api.routerai.com/v1
LLM_DEFAULT_MODEL=gpt-4o
LLM_DEFAULT_TEMPERATURE=0.1
LLM_DEFAULT_MAX_TOKENS=2000
```

## Архитектура конфигурации

Конфигурация централизована в файле [`app.config.ts`](src/config/app.config.ts:1). Все настройки LLM хранятся в объекте [`ILlmConfig`](src/config/app.config.ts:9):

```typescript
export interface ILlmConfig {
  routerAiApiKey: string;
  routerAiBaseUrl: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}
```

[`LlmService`](src/services/llm.service.ts:9) получает конфигурацию через dependency injection:

```typescript
const llmService = new LlmService(appConfig.llmConfig);
```

## Архитектура

### Новые компоненты

1. **LlmService** (`src/services/llm.service.ts`)
   - Отвечает за взаимодействие с RouterAI API
   - Преобразует текст PDF в структурированный JSON

2. **PdfLlmController** (`src/controllers/pdf-llm.controller.ts`)
   - Обрабатывает запросы на анализ PDF с LLM
   - Объединяет результаты парсинга и LLM анализа

3. **Интерфейсы** (`src/interfaces/llm-service.interface.ts`)
   - Типы для LLM запросов и ответов
   - Расширенный интерфейс результата PDF парсинга

### Структура данных LLM ответа

По умолчанию LLM возвращает JSON со следующей структурой:

```typescript
{
  summary: string;           // Краткое содержание
  keyPoints: string[];       // Основные пункты
  recommendations: string[]; // Рекомендации
  metadata: {
    documentType?: string;
    urgency?: string;
    // Дополнительные метаданные
  };
}
```

## Кастомизация

### Системные промпты

Можно переопределить системный промпт через параметр `systemPrompt`:

```bash
curl -X POST http://localhost:3000/api/parse-pdf-with-llm \
  -F "file=@document.pdf" \
  -F "systemPrompt=Ты эксперт по юридическим документам. Проанализируй договор и выдели ключевые условия."
```

### Пользовательские промпты

Для специфических задач можно задать пользовательский промпт:

```bash
curl -X POST http://localhost:3000/api/parse-pdf-with-llm \
  -F "file=@document.pdf" \
  -F "userPrompt=Сфокусируйся на финансовых показателях и выдели основные цифры."
```

## Обработка ошибок

- **400**: Неверный формат запроса или файл
- **502**: Ошибка соединения с RouterAI API
- **500**: Внутренняя ошибка сервера

## Пример использования

```javascript
// Пример использования с fetch
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('model', 'gpt-4o');
formData.append('temperature', '0.1');

const response = await fetch('/api/parse-pdf-with-llm', {
  method: 'POST',
  body: formData,
});

const result = await response.json();

if (result.llmAnalysis.success) {
  console.log('LLM анализ:', result.llmAnalysis.data);
} else {
  console.error('Ошибка LLM:', result.llmAnalysis.error);
}
```
