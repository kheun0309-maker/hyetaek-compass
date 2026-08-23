export interface GenerateOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
  provider: ProviderName;
  usage?: { input: number; output: number };
}

export interface AIProvider {
  readonly name: ProviderName;
  readonly model: string;
  generate(opts: GenerateOptions): Promise<GenerateResult>;
  /** 계정에서 실제 사용 가능한 모델 ID 목록 (진단용) */
  listModels(): Promise<string[]>;
}

export type ProviderName = "anthropic" | "openai" | "grok";

export const PROVIDER_NAMES: ProviderName[] = ["anthropic", "openai", "grok"];
