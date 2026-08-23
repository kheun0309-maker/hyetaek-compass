/**
 * Claude (Anthropic) 프로바이더 — 공식 @anthropic-ai/sdk 사용.
 *
 * 필요한 환경변수:
 *   ANTHROPIC_API_KEY   (미설정 시 `ant auth login` 프로필도 자동 인식)
 *   ANTHROPIC_MODEL     기본값 claude-opus-5
 *   ANTHROPIC_THINKING  adaptive(기본) | off
 */
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, GenerateOptions, GenerateResult } from "./types";

const DEFAULT_MODEL = "claude-opus-5";

/** adaptive thinking을 지원하는 모델 계열 */
function supportsAdaptiveThinking(model: string): boolean {
  return /^claude-(fable-5|mythos-5|opus-5|opus-4-[678]|sonnet-5|sonnet-4-6)/.test(
    model,
  );
}

export function createAnthropicProvider(): AIProvider {
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  // apiKey를 명시하지 않으면 SDK가 ANTHROPIC_API_KEY / auth 프로필을 순서대로 찾습니다.
  const client = new Anthropic();

  return {
    name: "anthropic",
    model,

    async listModels(): Promise<string[]> {
      const out: string[] = [];
      // SDK가 페이지네이션을 자동 처리합니다.
      for await (const m of client.models.list()) out.push(m.id);
      return out;
    },

    async generate(opts: GenerateOptions): Promise<GenerateResult> {
      const useThinking =
        process.env.ANTHROPIC_THINKING !== "off" &&
        supportsAdaptiveThinking(model);

      // 긴 출력이므로 스트리밍 사용 — HTTP 타임아웃을 피합니다.
      const stream = client.messages.stream({
        model,
        max_tokens: opts.maxTokens ?? 16000,
        system: opts.system,
        messages: [{ role: "user", content: opts.prompt }],
        ...(useThinking
          ? { thinking: { type: "adaptive" as const } }
          : { temperature: opts.temperature ?? 0.7 }),
      });

      const message = await stream.finalMessage();

      if (message.stop_reason === "refusal") {
        throw new Error(
          `[anthropic] 모델이 요청을 거절했습니다: ${JSON.stringify(message.stop_details)}`,
        );
      }

      // content는 판별 유니온 — thinking 블록을 제외하고 text만 모읍니다.
      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      return {
        text,
        model,
        provider: "anthropic",
        usage: {
          input: message.usage.input_tokens,
          output: message.usage.output_tokens,
        },
      };
    },
  };
}
