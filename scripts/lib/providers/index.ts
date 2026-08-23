/**
 * AI 프로바이더 팩토리.
 *
 * 선택 순서: CLI 인자(--provider) > 환경변수 AI_PROVIDER > 기본값 anthropic
 */
import { createAnthropicProvider } from "./anthropic";
import { createOpenAIProvider, createGrokProvider } from "./openai-compatible";
import { PROVIDER_NAMES, type AIProvider, type ProviderName } from "./types";

export * from "./types";

export function isProviderName(v: string): v is ProviderName {
  return (PROVIDER_NAMES as string[]).includes(v);
}

export function resolveProviderName(cliValue?: string): ProviderName {
  const raw = (cliValue ?? process.env.AI_PROVIDER ?? "anthropic")
    .trim()
    .toLowerCase();

  const alias: Record<string, ProviderName> = {
    claude: "anthropic",
    anthropic: "anthropic",
    openai: "openai",
    gpt: "openai",
    chatgpt: "openai",
    grok: "grok",
    xai: "grok",
  };

  const resolved = alias[raw];
  if (!resolved) {
    throw new Error(
      `알 수 없는 프로바이더 "${raw}". 사용 가능: ${PROVIDER_NAMES.join(", ")} (별칭: claude, gpt, xai)`,
    );
  }
  return resolved;
}

export function createProvider(cliValue?: string): AIProvider {
  const name = resolveProviderName(cliValue);
  switch (name) {
    case "anthropic":
      return createAnthropicProvider();
    case "openai":
      return createOpenAIProvider();
    case "grok":
      return createGrokProvider();
  }
}
