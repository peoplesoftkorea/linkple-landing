// AI 초안 정제 로직 — 네트워크·키 없이 도는 순수 함수 테스트 (미션 8).
import { describe, it, expect } from 'vitest';
import { buildUserPrompt, toDraft } from './draft.js';

describe('buildUserPrompt', () => {
  it('필수인 직무는 항상, 비운 항목은 프롬프트에서 빠진다', () => {
    const p = buildUserPrompt({ role: '주말 홀서빙' });
    expect(p).toContain('직무: 주말 홀서빙');
    expect(p).not.toContain('근무지');
    expect(p).not.toContain('강조하고 싶은 점');
  });

  it('채운 항목은 전부 실린다', () => {
    const p = buildUserPrompt({
      role: '홀서빙',
      location: '서울 마포구',
      conditions: '시급 13,000원',
      highlights: '식사 제공',
    });
    expect(p).toContain('근무지: 서울 마포구');
    expect(p).toContain('근무 조건: 시급 13,000원');
    expect(p).toContain('강조하고 싶은 점: 식사 제공');
  });
});

describe('toDraft — 모델 응답 정제', () => {
  const ok = {
    title: '주말 홀서빙 크루 모집',
    description: '주말 점심·저녁 피크타임에 홀 서빙과 테이블 정리를 맡습니다. 초보도 함께 배우며 시작할 수 있습니다.',
    requirements: ['주말 근무 가능', '  성실한 분  '],
    benefits: ['식사 제공'],
    category: '고객지원',
    employmentType: '파트타임',
  };

  it('정상 응답은 폼 모양으로 다듬어진다 (공백 정리 포함)', () => {
    const d = toDraft(ok);
    expect(d.title).toBe(ok.title);
    expect(d.requirements).toEqual(['주말 근무 가능', '성실한 분']);
    expect(d.category).toBe('고객지원');
  });

  it('목록에 없는 분류는 버린다 — 폼에서 사용자가 고른다', () => {
    const d = toDraft({ ...ok, category: '요식업', employmentType: '알바' });
    expect(d.category).toBe('');
    expect(d.employmentType).toBe('');
  });

  it('문자열이 아닌 배열 원소는 무시한다 (모델이 형식을 벗어나도 서버는 안 죽는다)', () => {
    const d = toDraft({ ...ok, requirements: ['가능', 3, null, { a: 1 }] });
    expect(d.requirements).toEqual(['가능']);
  });

  it('제목이 없거나 본문이 폼 하한(20자)에 못 미치면 초안이 아니다 → null', () => {
    expect(toDraft({ ...ok, title: '' })).toBeNull();
    expect(toDraft({ ...ok, description: '짧다' })).toBeNull();
    expect(toDraft(null)).toBeNull();
    expect(toDraft('문자열')).toBeNull();
  });
});
