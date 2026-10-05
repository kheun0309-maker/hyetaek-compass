/** AI 초안은 검토 표시까지 갖춰야 검색·RSS·사이트맵에 노출된다. */
export function isPublished(data: { draft?: unknown; aiGenerated?: unknown; reviewed?: unknown }): boolean {
  return data.draft !== true && (data.aiGenerated !== true || data.reviewed === true);
}
