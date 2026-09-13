// AI 공고문 초안 — 프롬프트 조립과 응답 정제 (미션 8).
//
// OpenAI 호출부(routes/ai.js)와 분리해 둔 이유: 이 둘은 네트워크 없이
// 검증할 수 있는 순수 함수라서, 테스트가 키 없이도 돈다.
import { CATEGORIES, EMPLOYMENT_TYPES } from '../validate.js';

export const SYSTEM_PROMPT = [
  '당신은 채용 공고문 작성 전문가입니다. 한국어로, 지원자가 읽고 바로 이해할 수 있는 공고 초안을 만듭니다.',
  '주어진 사실만 사용하고, 없는 조건(연봉·복지 등)을 지어내지 않습니다.',
  '반드시 JSON 형식으로만 답합니다.',
].join(' ');

const schemaGuide = JSON.stringify({
  title: '공고 제목 (40자 이내)',
  description: '담당 업무 소개 (3~5문장, 지원자에게 말 걸듯)',
  requirements: ['자격 요건 배열 (2~4개, 없으면 빈 배열)'],
  benefits: ['복지·혜택 배열 (입력에 근거가 있을 때만, 없으면 빈 배열)'],
  category: `다음 중 하나: ${CATEGORIES.join(', ')}`,
  employmentType: `다음 중 하나: ${EMPLOYMENT_TYPES.join(', ')}`,
});

export function buildUserPrompt({ role, location, conditions, highlights }) {
  return [
    '아래 정보로 채용 공고 초안을 만들어 주세요.',
    `- 직무: ${role}`,
    location ? `- 근무지: ${location}` : null,
    conditions ? `- 근무 조건: ${conditions}` : null,
    highlights ? `- 강조하고 싶은 점: ${highlights}` : null,
    `\n형식: ${schemaGuide}`,
  ].filter(Boolean).join('\n');
}

/**
 * 모델 응답을 폼 모양으로 다듬는다. 모델이 형식을 벗어나도 여기서 걸러진다 —
 * 목록에 없는 분류는 버리고(폼에서 사용자가 고른다), 문자열 아닌 값은 무시한다.
 * 폼 검증(담당 업무 20자 하한)을 못 넘는 초안은 초안이 아니므로 null.
 */
export function toDraft(raw) {
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const list = (v) =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()).slice(0, 6)
      : [];

  const title = str(raw?.title, 60);
  const description = str(raw?.description, 1000);
  if (!title || description.length < 20) return null;

  return {
    title,
    description,
    requirements: list(raw?.requirements),
    benefits: list(raw?.benefits),
    category: CATEGORIES.includes(raw?.category) ? raw.category : '',
    employmentType: EMPLOYMENT_TYPES.includes(raw?.employmentType) ? raw.employmentType : '',
  };
}
