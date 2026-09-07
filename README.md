# Linkple — 클라이언트-서버 MVP

> **채용부터 복지까지, 사람과 일을 잇다.** 통합 HR 플랫폼 Linkple의 MVP입니다.
> 코드잇 스프린트 · IT창업가 과정 **스프린트 미션 7**(백엔드 구현·배포) 제출물.
> 미션 6의 프론트엔드 데모가 이번 미션에서 **실제 서버·DB를 가진 웹 서비스**가 되었습니다.

| | |
|---|---|
| 🔗 **라이브 데모 (미션 7 · 프론트+API)** | **https://linkple-mission7.vercel.app** |
| 📄 **API 문서** | [`docs/API.md`](./docs/API.md) |
| 🔗 미션 6 프론트엔드 MVP | https://linkple-mvp.vercel.app |
| 🔗 미션 5 정적 랜딩 (디자인 원본) | https://linkple-landing.vercel.app |
| 📄 기능 명세서 · 유저플로우 | [`docs/spec/`](./docs/spec/) (도식 SVG 원본 포함) |

---

## 이번 미션(7)에서 한 일 — 브라우저 저장소를 서버로 바꿨다

미션 6까지 데이터는 사용자의 브라우저(localStorage) 안에만 있었습니다. 이번 미션에서
**Express + Prisma + PostgreSQL 백엔드**를 만들어 같은 기능이 서버에 저장되게 했고,
프론트와 백엔드를 **같은 오리진의 `/api`** 로 묶어 함께 배포했습니다.

| 층 | 미션 6 | 미션 7 |
|---|---|---|
| 데이터 | localStorage (내 브라우저에만) | **PostgreSQL** (서버에, 모두에게) |
| 인증 | 형식 검증뿐인 시뮬레이션 | **JWT** — bcrypt 해시 · 토큰 만료 · 보호 API |
| API | 없음 (선택적 Mock) | **RESTful 13개 엔드포인트** ([`docs/API.md`](./docs/API.md)) |
| 배포 | 정적 호스팅 | 정적 + **서버리스 함수** (동일 도메인) |

화면 코드는 거의 그대로입니다 — 미션 6에서 데이터 접근을 `src/data/repository.js` 한 파일로
모아 둔 덕분에, **API 전환에서 화면 20곳이 아니라 이 파일 하나를 바꿨습니다.**

---

## 미션 6에서 한 일

미션 5에서 순수 HTML·CSS·JS로 만든 **정적 랜딩 페이지**를, 사용자가 직접 써볼 수 있는
**React 기반 MVP**로 옮겼습니다. 보여주기 위한 화면에서 멈추지 않고, 공고를 올리고 찾고
지원하는 일이 실제로 **동작하고 저장되는** 수준까지 구현했습니다.

미션 5의 랜딩은 버리지 않고 홈 화면으로 **그대로 승계**했습니다.

| 미션 5 (정적 HTML) | 미션 6 (React) |
|---|---|
| Hero · CTA | `Home` 히어로 + **실시간 지표**(등록 공고·참여 기업·내 지원) |
| 문제 → 해결 섹션 | 동일 문구를 `Card` 컴포넌트로 재구성 |
| 핵심 기능 4종 (SVG 아이콘) | 아이콘·문구 그대로 이식 |
| 기대효과 · 타깃 | 동일 |
| 출시 알림 폼 *(화면만 있고 아무것도 저장되지 않던 폼)* | **동작하는 폼** — 검증 · localStorage 저장 · 재방문 시 신청 상태 유지 · 취소 |
| Aurora Green 컬러/타이포 | `tokens.css`로 승계 후 전 화면 공유 |

---

## 핵심 기능 (MVP 범위)

| # | 기능 | 내용 |
|---|---|---|
| 1 | **공고 탐색** | 키워드 검색 · 직군 필터 · 고용 형태 필터 · 3가지 정렬. 조건이 URL 쿼리에 남아 뒤로 가도 유지됩니다. |
| 2 | **공고 등록** | 9개 필드 폼. 필드별 실시간 검증 + 제출 시 오류 요약. 등록 즉시 목록에 반영·영속. |
| 3 | **공고 상세 → 지원 → 완료** | 상세에서 지원서 모달을 열어 제출하면 접수증(완료) 화면으로 이어집니다. |
| 4 | **내 지원 내역** | 접수한 지원서 조회 · 접수증 재확인 · 지원 철회. |

### 사용자 흐름

```
홈 → 공고 탐색 → 공고 상세 → (비로그인이면) 로그인 → 지원서 작성 → 접수 완료 → 내 지원 내역
                      ↘ 공고 등록(로그인 필요) → 등록한 공고 상세 → 삭제
```

로그인이 필요한 화면에 비로그인 상태로 들어가면 로그인 페이지로 보내고,
로그인 직후 **원래 하려던 화면으로 되돌립니다.**

---

## 화면 · 라우트

| 경로 | 화면 | 보호 |
|---|---|---|
| `/` | 홈 (랜딩 승계 + 실시간 지표 + 출시 알림 폼) | — |
| `/jobs` | 공고 목록 (검색·필터·정렬) | — |
| `/jobs/:jobId` | 공고 상세 (+ 지원 모달 · 삭제 확인 모달) | — |
| `/jobs/new` | 공고 등록 폼 | 🔒 로그인 |
| `/applications` | 내 지원 내역 (+ 철회 확인 모달) | 🔒 로그인 |
| `/applications/:id/done` | 지원 완료 · 접수증 | 🔒 로그인 |
| `/login` | 로그인 (시뮬레이션) | — |
| `*` | 404 | — |

---

## 기술 스택

**프론트엔드**

- **React 19** — 함수형 컴포넌트 · Hooks
- **React Router 7** — SPA 라우팅, 중첩 라우트, 보호 라우트, URL 쿼리 동기화
- **Vite 6** — 개발 서버 · 번들링 (개발 프록시로 `/api` → 로컬 서버)
- **CSS Modules + CSS 변수** — 미션 5의 Aurora Green 토큰을 그대로 승계

**백엔드 (미션 7)**

- **Express 5** — RESTful API 서버. 로컬은 상주 프로세스, 배포는 서버리스 함수로 같은 앱을 띄웁니다
- **Prisma + PostgreSQL** — 데이터 모델 4종 (User · Job · Application · WaitlistEntry)
- **JWT (jsonwebtoken) + bcrypt** — 토큰 로그인 · 비밀번호 해시 · 보호 엔드포인트
- **superstruct** — 요청 본문 검증 (서버는 클라이언트 검증을 신뢰하지 않습니다)

상태 관리는 **`useState` · `useReducer` · `useMemo` · `useCallback` + Context** 만 사용했습니다.
외부 상태 관리 라이브러리는 쓰지 않았습니다.

| Context | 역할 |
|---|---|
| `AuthProvider` | 로그인 상태 시뮬레이션 · 세션 영속 |
| `JobsProvider` | 공고·지원 데이터 (`useReducer`) · 로딩/에러 상태 |
| `ToastProvider` | 결과 알림 (자동 소멸) |

---

## 데이터 계층 — 화면은 데이터가 어디서 오는지 모른다

`src/data/repository.js` 한 곳만 API 주소를 압니다. 미션 6에서 localStorage와 Mock API를
같은 인터페이스로 겸용하도록 만들어 둔 자리이고, **미션 7에서 실제 API로 갈아탈 때
예고대로 이 파일 하나만 바꿨습니다.**

- 기본값은 **같은 오리진의 `/api`** — 배포본은 별도 설정 없이 서버리스 API를 부릅니다
- `VITE_API_BASE_URL` 로 주소를 바꿀 수 있습니다 (로컬 개발: `http://localhost:3001`)
- 이 파일이 **서버의 모양을 화면이 쓰던 모양으로 번역**합니다 — 서버 응답이 바뀌어도
  화면 20곳이 아니라 여기 한 곳을 고칩니다
- 서버가 4xx/5xx와 함께 보내는 `message` 는 **사용자에게 그대로 보여줄 수 있는 문장**이라
  토스트·에러 화면에 그대로 씁니다. 네트워크 단절은 별도의 문장으로 구분합니다

---

## 디자인 시스템

미션 5의 토큰(`--brand: #12b886` 외)을 `src/styles/tokens.css`로 옮기고,
그 위에 재사용 컴포넌트를 올렸습니다. 화면마다 버튼을 새로 만들지 않습니다.

| 컴포넌트 | 비고 |
|---|---|
| `Button` | 4가지 변형(primary/ghost/subtle/danger) × 3가지 크기 · 로딩 상태 · `to` 지정 시 링크로 렌더 |
| `Field` / `Input` / `Textarea` / `Select` | 라벨·힌트·에러·글자수를 한 벌로 묶음. 에러는 `aria-describedby`로 연결 |
| `Card` · `Badge` | 목록·상세·폼이 같은 표면을 공유 |
| `Modal` | ESC 닫기 · 배경 클릭 닫기 · 포커스 가두기 · 배경 스크롤 잠금 · 포커스 복귀 |
| `Toast` | 성공/정보/오류 · `aria-live` |
| `Skeleton` · `EmptyState` · `ErrorState` | '내용 없음' 세 가지 상태를 한 벌로 관리 |

### 타이포그래피 · 여백 (멘토 피드백 반영, 2026-08-21)

미션 5 피드백 — *"텍스트 밀도가 높아서 답답한 느낌을 줄 수 있습니다"* — 을 수치로 특정해 고쳤습니다.

| 지표 | 이전 | 이후 | 근거 |
|---|---|---|---|
| 기능 카드 줄당 글자 | 15자 | **33자** | 4열 그리드를 2열로. 한글 권장 25~35자 |
| 본문 행간 | 1.65 | **1.75** (카드 설명 1.8) | 한글은 라틴 문자보다 넉넉한 행간이 필요 |
| 섹션 상하 여백 | 64 / 0px | **96 / 96px** | 위에만 여백이 있어 앞 섹션과 경계가 흐렸음 |
| 문단 최대 폭 | 제한 없음 | **34em** | 넓은 화면에서 한 줄이 60자를 넘던 문제 |
| 줄바꿈 | `normal` | **`word-break: keep-all`** | 한글이 어절 한가운데서 잘리던 문제 |

카피도 함께 줄였습니다(홈 9곳 · 푸터 1곳). 여백만 넓히면 문서가 길어질 뿐이라,
문장 자체를 짧게 만드는 편이 지적의 본질에 가깝다고 판단했습니다.

### UX 상태 처리

- **로딩** — 카드와 같은 골격의 스켈레톤 6장 (화면이 튀지 않음)
- **빈 화면** — "등록된 공고 없음"과 "조건에 맞는 공고 없음"을 구분해 다른 행동을 제안
- **에러** — 저장소·API 실패 시 사유와 **다시 시도** 버튼 제시
- **검증** — 필드별 메시지 + 제출 시 오류 요약(포커스 이동)
- **에러 경계** — 렌더 중 예외가 나도 흰 화면 대신 원인과 복구 버튼을 남깁니다
- **문서 제목** — 화면마다 브라우저 탭 제목이 바뀝니다 (`공고 탐색 · Linkple`, `HR 매니저 · 그로우테크 · Linkple`)

### 접근성

`skip-link` · `:focus-visible` · `aria-live` · `aria-invalid`/`aria-describedby` ·
`aria-expanded`/`aria-controls` · `aria-pressed` · `role="dialog"` 포커스 트랩 ·
`prefers-reduced-motion` 대응. 모달은 열릴 때 닫기 버튼이 아니라 **첫 입력 칸으로 포커스를 옮깁니다** —
DOM 순서가 아니라 사용자가 할 일을 기준으로 삼았습니다.
모바일 퍼스트로 작성했고, 390px에서 가로 스크롤이 발생하지 않습니다.

---

## 폴더 구조

```
├── api/index.js              # ★ Vercel 서버리스 진입점 (/api 아래에 Express 앱을 마운트)
├── server/                   # ★ 미션 7 백엔드
│   ├── app.js                #   Express 앱 (미들웨어 순서 · 라우터 조립)
│   ├── index.js              #   로컬 상주 서버 (listen)
│   ├── middlewares.js        #   logger · attachUser · notFound · errorHandler
│   ├── validate.js           #   superstruct 요청 검증
│   ├── lib/                  #   jwt · prisma 클라이언트
│   └── routes/               #   auth · jobs · applications · waitlist
├── prisma/                   # ★ schema.prisma (모델 4종) · migrations · seed.js
├── docs/API.md               # ★ API 문서 (엔드포인트 · 요청/응답 · 상태 코드)
├── .env.example              # 로컬 환경 변수 예시 (.env는 커밋하지 않음)
├── db.json                   # (미션 6 유물) JSON Server용 Mock DB
├── scripts/generate-db.mjs   # 시드 → db.json 생성
└── src/
    ├── main.jsx              # 진입점 · Provider 조립
    ├── App.jsx               # 라우트 정의
    ├── styles/               # tokens.css · global.css
    ├── data/
    │   ├── repository.js     # ★ 데이터 접근 계층 (localStorage ↔ Mock API)
    │   ├── seedJobs.js       # Mock 데이터 10건
    │   └── constants.js
    ├── lib/                  # storage.js · validate.js · format.js · id.js (+ *.test.js)
    ├── contexts/             # Auth · Jobs · Toast (Provider + Context 분리)
    ├── hooks/                # useAuth · useJobs · useToast · useDocumentTitle
    ├── test/                 # Vitest 설정
    ├── components/
    │   ├── ui/               # 디자인 시스템 (Button · Field · Card · Modal · …)
    │   ├── layout/           # Layout · Header · Footer · ProtectedRoute · ErrorBoundary · …
    │   ├── home/             # WaitlistForm
    │   └── job/              # JobCard · JobFilters · ApplyModal
    └── pages/                # Home · Jobs · JobDetail · JobNew · Applications · ApplyDone · Login · NotFound
```

---

## 로컬 실행

PostgreSQL이 떠 있어야 합니다. `.env.example`을 `.env`로 복사해 값을 채웁니다.

```bash
npm install                  # postinstall이 prisma generate까지 수행
npm run db:migrate           # 스키마 적용 (prisma migrate dev)
npm run db:seed              # 데모 계정 + 공고 10건 시드

npm run api:dev              # 터미널 A — Express API (http://localhost:3001)
npm run dev                  # 터미널 B — 앱 (http://localhost:5173, /api는 프록시)

npm run build                # 프로덕션 빌드
npm run lint                 # ESLint
npm test                     # Vitest (44개)
```

개발 서버의 `/api` 요청은 Vite 프록시가 로컬 Express로 넘깁니다 — **개발과 배포가
같은 주소(`/api`)를 쓰므로 "로컬에선 됐는데"가 생기지 않습니다.**

### 데모 계정

시드가 만드는 계정으로 바로 로그인할 수 있습니다. 로그인 화면의
`데모 계정 채워 넣기` 버튼이 **`demo@linkple.kr / linkple2026`** 을 넣어 줍니다.
`POST /auth/signup` 으로 새 계정을 만들 수도 있습니다 (비밀번호는 bcrypt 해시로 저장).

---

## 테스트

미션의 요구사항은 아니지만, 손으로 매번 확인할 수 없는 규칙은 테스트로 고정했습니다.

```bash
npm test           # Vitest — 6개 파일 · 44개 테스트
npm run test:watch # 감시 모드
```

| 파일 | 검증 대상 |
|---|---|
| `lib/validate.test.js` | 공고·지원·로그인 폼의 모든 검증 규칙 (경계값 포함) |
| `lib/format.test.js` | 연봉/날짜/이메일 표기 — 억 단위 환산, 잘못된 값이 화면을 깨뜨리지 않는지 |
| `data/repository.test.js` | 시드 심기, 저장값 파손 시 복구, 영속, **공고 삭제 시 지원 내역 연쇄 정리** |
| `components/ui/Button.test.jsx` | 변형·링크 렌더·로딩 중 중복 제출 차단 |
| `components/job/JobCard.test.jsx` | 카드가 보여야 할 정보와 접근 가능한 링크 이름 |
| `components/layout/ErrorBoundary.test.jsx` | 자식이 터졌을 때 흰 화면 대신 복구 안내가 나오는지 |

> Node 26이 자체 `localStorage`를 전역에 올려 jsdom의 것을 가리는 문제가 있어,
> `src/test/setup.js`에서 테스트용 저장소를 직접 세웁니다.

---

## 미션 7 요구사항 대응

**기본 요구사항**

| 항목 | 구현 |
|---|---|
| 백엔드 기능 범위 정의 (핵심 API 2~4개) | **4개 영역** — 인증(`/auth`) · 공고(`/jobs`) · 지원(`/applications`) · 사전 신청(`/waitlist`). 선별 기준은 [`docs/API.md`](./docs/API.md) 서두 참고 |
| 서버 및 API 구현 (RESTful · 요청→처리→응답) | Express 5 · **13개 엔드포인트** · 자원 명사 + HTTP 메소드(GET/POST/DELETE) · 상태 코드 규약(200/201/204/400/401/403/404/409/500) |
| 데이터 저장 구조 설계 | Prisma 스키마 — **User · Job · Application · WaitlistEntry** 4개 모델, 관계·유니크 제약(`@@unique(jobId, email)` 중복 지원 차단) 포함 |
| 프론트엔드-백엔드 연동 (Mock 제거) | `repository.js` 가 실제 API 호출로 전환. 정상 응답은 화면 반영, 실패는 **서버의 message를 그대로 토스트·에러 화면에** 표시 + 다시 시도 |
| 배포 | Vercel — 정적 프론트 + 서버리스 API를 **같은 도메인**에. 프론트는 `/api` 상대 주소만 사용 |

**심화 요구사항**

| 항목 | 구현 |
|---|---|
| JWT 인증 흐름 | `POST /auth/signup`(bcrypt 해시) · `POST /auth/login`(JWT 발급·만료 2h) · `GET /auth/me` · `requireAuth` 미들웨어로 보호 API 6개 |
| 입력값 검증 · 에러 처리 | superstruct 스키마 검증 → 400 + 필드명, 도메인 규칙 위반은 401/403/404/409. 에러 응답은 항상 `{ message, field? }` 한 가지 모양 |
| 환경 분리 | `.env`(로컬) / Vercel 환경변수(배포) · `.env.example` 제공 · `NODE_ENV` 분기 · 프록시로 개발/배포가 같은 `/api` 주소 사용 |
| API 문서화 | [`docs/API.md`](./docs/API.md) — 전 엔드포인트의 요청/응답 예시 · 상태 코드 규약 · 데이터 모델 · 환경 변수 |

---

## 미션 6 요구사항 대응

**기본 요구사항**

| 항목 | 구현 |
|---|---|
| 핵심 기능 2~4개 선정 | 4개 (탐색 · 등록 · 지원 · 지원 관리) |
| 정적 디자인 → React 컴포넌트 | 미션 5의 5개 섹션 전부 승계 + 컴포넌트 계층으로 재구성 |
| 재사용 컴포넌트 설계 | `components/ui` 11종 |
| React Router 화면 이동 | 8개 라우트 · 중첩 라우트 · 보호 라우트 |
| 상태 관리 · 상호작용 | `useState`/`useReducer`/Context, 필터·정렬·모달 3종·토글·토스트 |
| 로컬 스토리지 / Mock 데이터 | 시드 10건 + 사용자 등록분, 새로고침 후 유지 |

**심화 요구사항**

| 항목 | 구현 |
|---|---|
| 간단한 인증 흐름 | localStorage 기반 로그인/로그아웃 · 보호 라우트 · 로그인 후 원래 화면 복귀 |
| UX 개선 | 로딩 스켈레톤 · 빈 화면 2종 · 에러 + 재시도 · 폼 검증 · 토스트 |
| 디자인 시스템 | 토큰 + 재사용 UI 컴포넌트로 전 화면 통일 |
| Mock Server *(선택)* | JSON Server + `repository.js` 전환 계층 |

**요구사항 밖에서 더한 것**

| 항목 | 구현 |
|---|---|
| 에러 경계 | 렌더 예외 시 흰 화면 방지 · 원인 표시 · 복구 버튼 |
| 화면별 문서 제목 | 8개 라우트가 탭에서 구분됨 |
| 테스트 | Vitest 44개 (검증 규칙 · 데이터 계층 · 컴포넌트) |
| 접근성 | 모달 포커스 트랩/초기 포커스, `aria-*` 연결, 키보드 탐색 |
| 반응형 | 모바일 퍼스트 · 390px 가로 스크롤 0 |

---

## 안내

본 저장소와 페이지는 **학습 목적**이며 실제 상용 서비스가 아닙니다.
결제·채용 중개를 제공하지 않고, 화면에 보이는 기업·공고·지원자 정보는
모두 학습용 가상 데이터입니다. 입력한 값은 **학습용 서버에 저장되며 언제든 초기화될 수
있습니다** — 실제 개인정보를 입력하지 마세요.
