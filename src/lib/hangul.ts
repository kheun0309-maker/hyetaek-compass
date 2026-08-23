/**
 * 한글 검색 유틸리티.
 * - 초성 검색 지원 ("청년월세" → "ㅊㄴㅇㅅ"로도 찾힘)
 * - 공백/특수문자 무시 매칭
 */

const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;

/** 문자열에서 한글 음절의 초성만 추출. 한글이 아니면 그대로 유지. */
export function toChosung(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    if (code >= HANGUL_BASE && code <= HANGUL_END) {
      out += CHO[Math.floor((code - HANGUL_BASE) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

/** 검색 비교용 정규화: 소문자 + 공백/기호 제거 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\-_.,!?()[\]{}'"`~/\|:;<>+=*&^%$#@]/g, "");
}

/** 입력이 전부 초성 자모인지 (예: "ㅊㄴㅇㅅ") */
export function isChosungQuery(q: string): boolean {
  const stripped = normalize(q);
  return stripped.length > 0 && [...stripped].every((c) => CHO.includes(c));
}
