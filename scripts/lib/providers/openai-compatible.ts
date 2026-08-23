/**
 * OpenAI 및 OpenAI 호환 API(Grok/xAI) 프로바이더 — 공식 openai SDK 사용.
 *
 * OpenAI:
 *   OPENAI_API_KEY / OPENAI_MODEL (기본 gpt-5.1) / OPENAI_BASE_URL(선택)
 * Grok (xAI):
 *   XAI_API_KEY / XAI_MODEL (기본 grok-4) / XAI_BASE_URL (기본 https://api.x.ai/v1)
 *
 * ⚠️ 모델 ID는 계정에서 실제 사용 가능한 값으로 .env에서 덮어쓰세요.
 */
import OpenAI from "openai";
import type {
  AIProvider,
  GenerateOptions,
  GenerateResult,
  ProviderName,
} from "./types";

interface CompatConfig {
  name: ProviderName;
  apiKey: string | undefined;
  apiKeyEnv: string;
  model: string;
  baseURL?: string;
}

function build(cfg: CompatConfig): AIProvider {
  if (!cfg.apiKey) {
    throw new Error(
      `[${cfg.name}] 환경변수 ${cfg.apiKeyEnv} 가 설정되지 않았습니다. .env 파일을 확인하세요.`,
    );
  }

  const client = new OpenAI({
    apiKey: cfg.apiKey,
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    timeout: 10 * 60 * 1000,
    maxRetries: 2,
  });

  return {
    name: cfg.name,
    model: cfg.model,

    async listModels(): Promise<string[]> {
      const res = await client.models.list();
      return res.data.map((m) => m.id).sort();
    },

    async generate(opts: GenerateOptions): Promise<GenerateResult> {
      // 스트리밍으로 받아 긴 응답의 타임아웃을 회피합니다.
      const stream = await client.chat.completions.create({
        model: cfg.model,
        max_completion_tokens: opts.maxTokens ?? 16000,
        temperature: opts.temperature ?? 0.7,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.prompt },
        ],
      });

      let text = "";
      let usage: GenerateResult["usage"];

      for await (const part of stream) {
        const delta = part.choices?.[0]?.delta?.content;
        if (delta) text += delta;
        if (part.usage) {
          usage = {
            input: part.usage.prompt_tokens ?? 0,
            output: part.usage.completion_tokens ?? 0,
          };
        }
      }

      if (!text.trim()) {
        throw new Error(`[${cfg.name}] 빈 응답을 받았습니다. 모델 ID(${cfg.model})를 확인하세요.`);
      }

      return { text, model: cfg.model, provider: cfg.name, usage };
    },
  };
}

export function createOpenAIProvider(): AIProvider {
  return build({
    name: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    apiKeyEnv: "OPENAI_API_KEY",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5.1",
    baseURL: process.env.OPENAI_BASE_URL?.trim() || undefined,
  });
}

export function createGrokProvider(): AIProvider {
  return build({
    name: "grok",
    apiKey: process.env.XAI_API_KEY,
    apiKeyEnv: "XAI_API_KEY",
    model: process.env.XAI_MODEL?.trim() || "grok-4",
    baseURL: process.env.XAI_BASE_URL?.trim() || "https://api.x.ai/v1",
  });
}
