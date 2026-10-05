export type SourceKind = "official" | "news" | "blog" | "video";

export interface TopicSource {
  id: string;
  label: string;
  kind: SourceKind;
  format: "rss" | "atom" | "knps" | "kma";
  url: string;
  home: string;
  linkHosts: string[];
}

export interface SourceItem {
  title: string;
  url: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  kind: SourceKind;
}

export interface SourceCheck {
  sourceId: string;
  status: "ok" | "error";
  attemptedAt: string;
  /** 실패했을 때 마지막 성공 시점을 덮어쓰지 않는다. */
  checkedAt?: string;
  count: number;
}

export interface TopicDigest {
  topic: string;
  collectedAt: string;
  items: SourceItem[];
  checks: SourceCheck[];
}
