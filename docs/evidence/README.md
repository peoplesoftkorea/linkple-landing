# 미션 9-1 로깅 증빙

## 1. 로깅 구현
- `logging-code/analytics.js` — Amplitude SDK 초기화 + gtag(GA4) 직접 초기화 · UTM 첫 값 보존 ·
  이벤트 정의서(EVENTS) · 정의서 밖 이름은 전송 거부 · `window.__LOG_QA`(로그 QA 용 기록)
- `logging-code/qa-tracking.mjs` — 로그 QA 자동 검사기(문서 ↔ 상수 ↔ 호출부 대조 9항)
- ★GTM 은 쓰지 않는다 — 코드를 직접 고칠 수 있어 GTM 의 장점이 값을 내지 못하고, 계측 진입로가
  하나 더 늘어난다. 그래서 GTM 태그 화면 대신 로깅 코드를 증빙으로 넣는다.

## 2. Amplitude 수집 — `amplitude-live-events-20260930.png`
프로젝트 `linkple-mission9` 라이브 이벤트. `ai_draft_accepted` · `ai_draft_requested` ·
`job_new_opened` · `page_view` · `job_detail_viewed` · `login_completed` · `login_started` ·
`apply_started` 가 시간 역순으로 들어온다.
★로그인 전은 「익명 사용자」, 로그인 후는 사용자 ID 로 바뀐다 — 한 사람의 행동이 로그인 전후로 이어진다.

## 3. GA4 수집 — `ga4-realtime-20260930.png`
속성 `linkple-mission9`(측정 ID G-8B4G6MFMPW) 실시간 개요. 지난 30분 활성 사용자 4명.
이벤트 `page_view` 14 · `first_visit` 4 · `session_start` 4 · `job_detail_viewed` 2 ·
`job_new_opened` 2 · `ai_draft_accepted` 1.

## 4. 로그 QA 결과
- 층 1(자동) — `npm run qa:tracking` 9항 전건 통과. 대조군 3항으로 검사기가 «잡는 것»을 먼저 확인했다.
- 층 2(배포본) — 퍼널 전 구간을 밟아 **13종 전부 발화 확인**. 그 과정에서 결함 3건을 찾아 고쳤다.
  ⑴`job_list_viewed` 가 존재하지 않는 상태값과 비교해 영원히 찍히지 않았다
  ⑵`page_view` 와 ⑶`job_new_opened` 가 재마운트로 중복 전송됐다(분모가 부풀면 전환율이 낮게 보인다)
