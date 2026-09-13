// AI 공고문 작성 도우미 (미션 8).
//
// 키는 이 파일이 도는 서버에만 있다. 브라우저는 우리 API만 알고,
// 우리 API가 OpenAI를 안다 — 프록시가 곧 키 보호다.
import { Router } from 'express';
import * as s from 'superstruct';
import OpenAI from 'openai';
import { requireAuth, httpError } from '../middlewares.js';
import { SYSTEM_PROMPT, buildUserPrompt, toDraft } from '../lib/draft.js';

const router = Router();

// 입력은 문장이 아니라 단어 수준이다. 길이 상한이 곧 비용 상한의 절반이다.
const DraftInput = s.object({
  role: s.size(s.string(), 2, 60),                       // 직무 — 유일한 필수
  location: s.optional(s.size(s.string(), 0, 60)),
  conditions: s.optional(s.size(s.string(), 0, 200)),    // 시급·시간대 등
  highlights: s.optional(s.size(s.string(), 0, 200)),    // 강조하고 싶은 점
});

// 초안 생성 — 로그인 사용자만. 익명에게 열면 남의 돈으로 도는 API가 된다.
router.post('/draft', requireAuth, async (req, res) => {
  s.assert(req.body, DraftInput);

  if (!process.env.OPENAI_API_KEY) {
    // 키가 없는 환경(로컬 미설정 등)에서 500 스택 대신 사람이 읽을 문장을 준다.
    throw httpError(503, 'AI 초안 기능이 준비되지 않았습니다. 직접 작성해 주세요.');
  }

  // 시간 예산 8초·자동 재시도 없음 — Vercel 서버리스 함수 제한(기본 10초) 안에서 끝나야
  // 사용자가 '타임아웃'이 아니라 우리가 쓴 실패 문장을 본다. 실측 응답 1.3~2.1초라 여유 충분.
  // 재시도는 사용자의 [초안 만들기] 재클릭이 맡는다.
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8_000, maxRetries: 0 });

  let response;
  try {
    response = await client.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(req.body) },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 700,          // 공고 초안 상한 — 비용 상한의 나머지 절반
    });
  } catch (err) {
    console.error('[ai/draft] OpenAI 호출 실패:', err.status ?? '', err.message);
    throw httpError(502, 'AI 초안 생성에 실패했습니다. 다시 시도하거나 직접 작성해 주세요.');
  }

  let draft = null;
  try {
    draft = toDraft(JSON.parse(response.choices[0].message.content));
  } catch { /* 아래 공통 처리 */ }
  if (!draft) {
    throw httpError(502, 'AI가 쓸 만한 초안을 만들지 못했습니다. 다시 시도해 주세요.');
  }

  res.send(draft);
});

export default router;
