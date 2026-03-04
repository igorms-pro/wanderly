import OpenAI from 'openai';
import { z } from 'zod';

import { Analytics } from '../analytics';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export class OpenAIError extends Error {
  code: string;
  status?: number;
  cause?: unknown;

  constructor(message: string, options: { code: string; status?: number; cause?: unknown }) {
    super(message);
    this.name = 'OpenAIError';
    this.code = options.code;
    this.status = options.status;
    this.cause = options.cause;
  }
}

const openaiClient = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  : null;

export type OpenAIChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

export interface CallOpenAIChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface OpenAIChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface OpenAIChatResult {
  content: string;
  durationMs: number;
  usage?: OpenAIChatUsage;
}

export async function callOpenAIChat(
  model: string,
  messages: OpenAIChatMessage[],
  options: CallOpenAIChatOptions = {},
): Promise<OpenAIChatResult> {
  if (!openaiClient) {
    throw new OpenAIError('OpenAI API key is missing or invalid', { code: 'config_missing' });
  }

  const start = performance.now();

  try {
    const completion = await openaiClient.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      response_format: options.responseFormat ? { type: options.responseFormat } : undefined,
      max_tokens: options.maxTokens,
    });

    const end = performance.now();
    const message = completion.choices[0]?.message;
    const content = message?.content;

    if (!content) {
      throw new OpenAIError('Empty content in OpenAI response', { code: 'empty_response' });
    }

    return {
      content: typeof content === 'string' ? content : JSON.stringify(content),
      durationMs: end - start,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };
  } catch (error) {
    const end = performance.now();
    const durationMs = end - start;

    Analytics.trackError(
      error instanceof Error ? error.message : 'Unknown OpenAI error',
      'openai_chat',
      {
        duration_ms: Math.round(durationMs),
        model,
      },
    );

    if (import.meta.env.DEV) {
      console.error('[OpenAI] chat error:', error);
    }

    if (error instanceof OpenAIError) throw error;

    throw new OpenAIError('Failed to call OpenAI chat API', {
      code: 'request_failed',
      cause: error,
    });
  }
}

export function parseJSONResponse<T>(content: string, schema: z.ZodSchema<T>): T {
  try {
    const json = JSON.parse(content);
    return schema.parse(json);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[OpenAI] JSON parse/validation error', error, { content });
    }

    throw new OpenAIError('Invalid JSON response from OpenAI', {
      code: 'invalid_json',
      cause: error,
    });
  }
}
