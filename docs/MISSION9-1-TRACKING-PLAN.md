# 미션 9-1 — Tracking Plan (이벤트 정의서)

> 대상: **linkple 채용 공고 MVP** · 코드 정본 `src/lib/analytics.js` 의 `EVENTS`
> 작성 2026-09-30 · 짝 문서 [지표 설계](./MISSION9-1-METRICS.md)
> 검사: `npm run qa:tracking` — 이 문서와 코드가 어긋나면 실패한다

---

## 1. 설계 원칙 4가지

1. **이름은 한 곳에만 적는다** — `EVENTS` 상수. 화면에서 문자열을 직접 쓰면 오타가 조용히 새 이벤트를
   만들고, 그 이벤트는 「행동이 없었다」와 구별되지 않는다. 정의서 밖 이름은 전송하지 않고 오류를 낸다.
2. **찍는 시점을 문장으로 적는다** — 「언제」가 비면 사람마다 다른 자리에 심는다. 아래 표의 `언제` 열이
   그 문장이고, 코드 주석과 같은 말이어야 한다.
3. **성공한 뒤에 보낸다** — 버튼 클릭과 서버 저장 성공은 다른 사건이다. 완료형 이벤트
   (`apply_submitted` · `job_posted`)는 저장이 성공한 뒤에만 보낸다.
4. **속성에 식별 정보를 싣지 않는다** — 길이·여부·분류만. 누가 했는지는 사용자 식별자(`user_id`)로 묶고,
   이름·이메일·연락처는 이벤트에 넣지 않는다.

---

## 2. 이벤트 13종

| # | 이벤트 | 언제 보내는가(trigger) | 속성 | 쓰이는 지표 | 전송 |
|---|---|---|---|---|---|
| 1 | `page_view` | 라우트가 바뀐 직후(SPA 이므로 직접 보낸다) | `path` · `referrer_kind` · UTM 5 | 방문자 수 · 유입 분석 | Amplitude · GA4 |
| 2 | `job_list_viewed` | 공고 목록이 **성공적으로 로드돼 보인 직후**(로딩 실패는 조회가 아니다) | `total` | 목록 진입률 | Amplitude · GA4 |
| 3 | `job_search_used` | 검색·필터·정렬을 바꾼 직후 | `used_keyword` · `category` · `employment_type` · `sort` | 탐색 행동 | Amplitude · GA4 |
| 4 | `job_detail_viewed` | 공고 상세가 **실제로 존재해** 화면에 뜬 직후(없는 id 는 제외) | `job_id` · `category` · `employment_type` · `already_applied` | 상세 열람률 | Amplitude · GA4 |
| 5 | `login_started` | 로그인 폼 검증을 통과해 요청을 보내기 직전 | `method` · `from` | 로그인 통과율(분모) | Amplitude · GA4 |
| 6 | `login_completed` | 세션이 실제로 발급된 직후 | `method` · `role` | 로그인 통과율 | Amplitude · GA4 |
| 7 | `apply_started` | 지원 버튼을 누른 직후 — **로그인 여부와 무관하게** 보낸다 | `job_id` · `authenticated` | 지원 착수율 · 로그인 벽 이탈 | Amplitude · GA4 |
| 8 | ★`apply_submitted` | 지원서가 **서버에 저장된 직후**(구직자 Aha) | `job_id` · `application_id` · `category` | **북극성** · 지원 완주율 | Amplitude · GA4 |
| 9 | `job_new_opened` | 공고 작성 화면에 들어온 직후 | — | 작성 진입률 | Amplitude · GA4 |
| 10 | `ai_draft_requested` | AI 초안 요청을 보내기 직전(입력 검증 통과 후) | `role_len` · `has_location` · `has_conditions` · `has_highlights` | AI 초안 사용률 | Amplitude · GA4 |
| 11 | `ai_draft_accepted` | 초안이 **폼에 실제로 채워진 직후**(응답 도착과 구별한다) | `title_len` · `description_len` · `requirements_count` | AI 초안 채택률 | Amplitude · GA4 |
| 12 | ★`job_posted` | 공고가 **서버에 저장된 직후**(구인자 Aha) | `job_id` · `used_ai` · `category` · `employment_type` | 공고 게시율 · AI 기여도 | Amplitude · GA4 |
| 13 | `application_list_viewed` | 내 지원 내역 화면을 본 직후 | `total` | 재방문(Retention) 기초 | Amplitude · GA4 |

★모든 이벤트에 **UTM 5종이 함께 실린다** — 유입 경로별로 행동을 가를 수 있어야 하기 때문이다.

---

## 3. User Property

| 속성 | 값 | 언제 정해지는가 | 왜 필요한가 |
|---|---|---|---|
| `utm_source` · `utm_medium` · `utm_campaign` · `utm_content` · `utm_term` | 첫 진입 URL 의 값 | **첫 방문 1회**(이후 유지) | 채널·소재별 행동 차이 |
| `first_referrer_kind` | `direct` / `external` / `internal` | 첫 방문 | UTM 이 없는 유입의 성격 |
| `device` | `mobile` / `desktop` | 첫 방문 | 화면 크기별 전환 차이 |
| `role` | `seeker` / `employer` | 로그인 시 | 양면 퍼널을 가르는 축 |
| `is_logged_in` | true / false | 로그인·로그아웃 시 | 비로그인 이탈 분석 |

⛔이름·이메일·연락처는 User Property 로도 올리지 않는다.

---

## 4. 로그 QA — 두 층으로 확인한다

### 층 1. 코드 대조(자동) — `npm run qa:tracking`
이 문서의 표와 `EVENTS` 상수, 그리고 **실제 호출부**를 셋 다 비교한다.
- 정의서에 있는데 **부르는 곳이 없는** 이벤트 → 실패(「설계만 하고 안 찍는 것」)
- 코드가 부르는데 **문서에 없는** 이벤트 → 실패(문서가 낡은 것)
- 문서 표에 있는데 **상수에 없는** 이벤트 → 실패(오타)
★검사기 자체도 시험한다 — 없는 이름을 주입해 «잡히는지» 먼저 확인한 뒤 결과를 믿는다.

### 층 2. 브라우저 확인(수동·증빙용)
1. `npm run dev` 로 띄운다. 키가 없어도 콘솔에 `[track] …` 이 찍힌다.
2. 홈 → 목록 → 상세 → 로그인 → 지원 → 완료까지 한 번 통과한다.
3. 콘솔에서 `window.__LOG_QA` 를 확인한다 — **이 세션에서 실제로 보낸 이벤트가 순서대로** 담긴다.
   각 항목의 `sinks` 가 어디로 나갔는지 알려준다(`amplitude` · `ga4` · 비었으면 전송 안 됨).
4. 키를 넣고 배포한 뒤 **Amplitude 의 Live Events** 와 **GA4 실시간** 화면에서 같은 순서가 보이는지
   대조한다. ⇒ 이 두 화면 캡처가 미션 제출용 증빙이 된다.

⚠️`sinks` 가 비어 있으면 **전송되지 않았다**는 뜻이다. 콘솔에 찍혔다는 것과 도구에 도착했다는 것은
다른 사실이다.

### 층 2 실측 기록 [2026-09-30 · 헤드리스 브라우저]

| 확인한 것 | 결과 |
|---|---|
| 계측 초기화 · UTM 5종 캡처 → User Property | ✅ `utm_source=kakao` 외 4종이 실렸다 |
| `page_view` — 첫 진입 `/` · SPA 이동 `/jobs` | ✅ 각 1건 |
| `job_search_used` | ✅ 필터 변경 시 1건 |
| 🔴**같은 경로 중복 전송** | **결함 1건을 찾아 고쳤다** — 개발 모드 이중 마운트로 `/` 가 2건 찍혔다. 그대로 두면 방문자 수가 부풀고 그 위의 전환율이 전부 낮게 보인다 ⇒ 경로 비교로 차단 |
| `job_list_viewed` 이하(상세·지원·등록) | ⏸**로컬에서 확인 불가** — 목록 API 를 다른 출처에서 부르면 브라우저가 차단한다(CORS 헤더 없음[실측]). 목록이 비어 「조회」가 성립하지 않는다 |

⇒ **남은 확인은 배포본에서 한다**(같은 출처라 API 가 정상 작동한다). 순서 = 키 2종 주입 → 배포 →
퍼널 1회 통과 → `window.__LOG_QA` 와 Amplitude Live Events · GA4 실시간을 **대조**하고 캡처한다.

### 🔴배포본 실측에서 잡은 결함 1건 [2026-09-30]

`job_list_viewed` 가 **영원히 찍히지 않는 상태**였다. 목록 상태값은 `loading | ready | error` 인데
코드가 **존재하지 않는 `"success"`** 와 비교하고 있어 그 분기에 도달할 수 없었다.

⛔**층 1(코드 대조)은 이것을 잡지 못한다** — 「호출부가 있는가」만 보기 때문이다. 호출은 있었고
다만 닿지 않았다. **도달 불가능한 분기는 「행동이 없었다」와 똑같이 0을 준다.**
⇒ 배포본에서 퍼널을 한 번 밟아 본 뒤에야 드러났다. 정정 후 재배포하여 발화를 확인했다.

### 배포본 실측 결과 [2026-09-30 · Amplitude 키 주입 후]

| 확인 | 결과 |
|---|---|
| Amplitude 전송 | ✅ `POST api2.amplitude.com/2/httpapi` 발생 |
| 발화 확인 이벤트 | `page_view` · `job_list_viewed` · `job_detail_viewed` · `apply_started` — 전부 `sinks=[amplitude]` |
| 미확인(로그인 필요) | `login_*` · `apply_submitted` · `job_new_opened` · `ai_draft_*` · `job_posted` · `application_list_viewed` |
| GA4 | ✅ **실시간 보고서에 집계 확인** — 활성 사용자 4명 · `page_view` 14 · `job_detail_viewed` 2 · `job_new_opened` 2 · `ai_draft_accepted` 1 (증빙 `docs/evidence/ga4-realtime-20260930.png`) |

**최종 실측 [2026-09-30 · GA4 주입 후 재배포]** — 발화한 이벤트 전부가 `sinks=[amplitude,ga4]` 로
**두 도구에 동시 전송**된다. Amplitude `POST /2/httpapi` 4건, GA4 `g/collect` 요청 확인.

### ⛔GA4 에서 `204` 는 「집계됐다」가 아니다 [2026-09-30 실측]

`google-analytics.com/g/collect` 는 **내용을 검사하지 않고 항상 204 를 반환한다.** 헤드리스
브라우저로 보내도 204, UA 를 일반 크롬으로 위장해도 204 였다. 그런데 GA4 실시간 보고서에는
**활성 사용자 0** 이었다 — GA4 가 알려진 봇 트래픽을 자동 제외하기 때문이다(해제 불가).

⇒ **요청이 도달했다**와 **집계됐다**는 다른 사실이다. 전자는 네트워크로 재고, 후자는 GA4 화면
(실시간 보고서)으로만 확인된다. ★검증 트래픽으로는 후자를 만들 수 없으므로, **실제 사용자의
접속 1회**가 필요하다. 이것이 UTM 홍보를 계측 배선 «뒤»에 해야 하는 또 하나의 이유다.

### 전 퍼널 실증 [2026-09-30 · 로컬 서버 + 시드 계정]

배포본에서는 로그인 뒤 경로를 밟을 수 없어(계정 조작은 라이브에서 하지 않는다) **로컬에 API 서버를
띄우고 시드 계정으로 전 구간을 통과**했다. 검증 트래픽임을 `utm_source=qa` 로 표시해 나중에
분석에서 제외할 수 있게 했다.

| 이벤트 | 발화 | 이벤트 | 발화 |
|---|---|---|---|
| `page_view` | ✅ | `login_completed` | ✅ |
| `job_list_viewed` | ✅ | `apply_started` | ✅ |
| `job_search_used` | ✅ | ★`apply_submitted` | ✅ **구직자 Aha** |
| `job_detail_viewed` | ✅ | `job_new_opened` | ✅ |
| `login_started` | ✅ | ★`job_posted` | ✅ **구인자 Aha** |
| `application_list_viewed` | ✅ | `ai_draft_requested` · `ai_draft_accepted` | ✅ |

**13종 전부 발화 확인**(전부 `sinks=[amplitude,ga4]`). 마지막 2종(AI 초안)은 배포본에서 실제로
초안을 생성해 Amplitude 라이브 이벤트로 확인했다 — 증빙 `docs/evidence/amplitude-live-events-20260930.png`.

★같은 화면이 **사용자 식별도 함께 증명한다** — 로그인 전은 「익명 사용자」, 로그인 후는 사용자 ID 로
바뀐다. 한 사람의 행동이 로그인 전후로 이어진다는 뜻이다.

🔴**「고쳤다」와 「나갔다」는 다르다** — 그 화면의 `job_new_opened` 2건은 중복 차단을 **커밋만 하고
배포하지 않은** 상태의 기록이다. 배포 후 해소. 커밋 로그를 보고 「고쳤다」고 판단하면 틀린다.

🔴**이 과정에서 결함 1건 추가 발견** — `job_new_opened` 가 재마운트로 2건 찍혔다. 분모가 부풀면
공고 게시율이 실제보다 낮게 보인다. `page_view` 와 같은 방식으로 차단했다.

★**「코드 대조 통과」를 「찍힌다」로 읽지 않는다.** 층 1(9항)은 이름과 자리가 맞는지를 보고,
도구에 도착하는지는 층 2 만 답할 수 있다.

---

## 5. 환경 변수

| 이름 | 용도 | 없으면 |
|---|---|---|
| `VITE_AMPLITUDE_API_KEY` | Amplitude 전송 | 전송 없이 콘솔·`__LOG_QA` 에만 남는다(경고 1회) |
| `VITE_GA4_MEASUREMENT_ID` | GA4 전송(`G-…`) | 같음 |
| `VITE_TRACK_DEBUG` | 배포본에서도 콘솔 로그를 켠다(`1`) | 개발 모드에서만 로그 |

⚠️**이 앱 전용 값을 넣는다.** 다른 서비스의 GA4 속성·Amplitude 프로젝트를 재사용하면 두 서비스의
데이터가 한 곳에 섞여 어느 쪽 수치인지 가릴 수 없게 된다.

---

## 6. GTM 을 쓰지 않는 이유

GTM 의 장점은 「개발자 없이 태그를 심는 것」이다. 이 프로젝트는 코드를 직접 고칠 수 있어 그 장점이
값을 내지 못하고, **계측 진입로가 하나 더 늘어나** 「어디서 보낸 이벤트인가」를 추적하기 어려워진다.
⇒ `gtag.js` 를 코드에서 직접 초기화한다(`src/lib/analytics.js`). 증빙에는 **GTM 태그 화면 대신
로깅 코드**를 넣는다.
