# Linkple — 프론트엔드 MVP

> **채용부터 복지까지, 사람과 일을 잇다.** 통합 HR 플랫폼 Linkple의 **프론트엔드 MVP**입니다.
> 코드잇 스프린트 · IT창업가 과정 **스프린트 미션 6**(프론트엔드 MVP 구현) 제출물.

| | |
|---|---|
| 🔗 **라이브 데모** | **https://linkple-mvp.vercel.app** |
| 🔗 미션 5 정적 랜딩 (디자인 원본) | https://linkple-landing.vercel.app |

---

## 이번 미션에서 한 일

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

- **React 19** — 함수형 컴포넌트 · Hooks
- **React Router 7** — SPA 라우팅, 중첩 라우트, 보호 라우트, URL 쿼리 동기화
- **Vite 6** — 개발 서버 · 번들링
- **CSS Modules + CSS 변수** — 미션 5의 Aurora Green 토큰을 그대로 승계
- **JSON Server** — 선택적 Mock API (아래 참고)

상태 관리는 **`useState` · `useReducer` · `useMemo` · `useCallback` + Context** 만 사용했습니다.
외부 상태 관리 라이브러리는 쓰지 않았습니다.

| Context | 역할 |
|---|---|
| `AuthProvider` | 로그인 상태 시뮬레이션 · 세션 영속 |
| `JobsProvider` | 공고·지원 데이터 (`useReducer`) · 로딩/에러 상태 |
| `ToastProvider` | 결과 알림 (자동 소멸) |

---

## 데이터 계층 — localStorage와 Mock API 겸용

화면은 데이터가 어디서 오는지 모릅니다. `src/data/repository.js` 한 곳만 알고 있습니다.

| 모드 | 조건 | 동작 |
|---|---|---|
| **localStorage** (기본값) | `VITE_API_BASE_URL` 없음 | 첫 방문 시 Mock 데이터 10건을 심고, 이후 브라우저 저장소를 읽고 씁니다. **배포본이 이 모드**라 서버 없이 그대로 동작합니다. |
| **Mock API** | `VITE_API_BASE_URL` 설정 | JSON Server(`db.json`)를 실제 REST API처럼 호출합니다. |

두 구현이 같은 인터페이스(`loadAll` · `createJob` · `deleteJob` · `createApplication` · `deleteApplication`)를
따르므로, **미션 7에서 실제 API로 갈아탈 때 바꿀 곳은 이 파일 하나**입니다.

Mock API 모드는 서버가 꺼져 있으면 **에러 화면과 다시 시도 버튼**을 띄웁니다.
`useEffect` 안에서 조용히 실패하지 않게 하려고 만든 경로입니다.

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
├── db.json                   # JSON Server용 Mock DB (공고 10건, `npm run seed:db`로 재생성)
├── .env.example              # Mock API 모드 설정 예시
├── scripts/generate-db.mjs   # 시드 → db.json 생성 (시드 정본은 한 곳뿐)
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

```bash
npm install
npm run dev      # http://localhost:5173  (localStorage 모드)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 확인
npm run lint     # ESLint
npm test         # Vitest (41개)
```

### Mock API 모드로 켜기

```bash
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:3001
npm run server               # 터미널 A — JSON Server (db.json)
npm run dev                  # 터미널 B — 앱
```

`.env.local`을 지우면 다시 localStorage 모드로 돌아갑니다.

### 데모 계정

실제 인증은 하지 않습니다. **형식이 맞는 이메일 + 6자 이상 비밀번호**면 로그인됩니다.
로그인 화면의 `데모 계정 채워 넣기` 버튼으로 `hr@linkple.kr / linkple123` 을 바로 넣을 수 있습니다.

> 데이터를 처음 상태로 되돌리려면 브라우저 콘솔에서
> `localStorage.clear()` 후 새로고침하세요.

---

## 테스트

미션의 요구사항은 아니지만, 손으로 매번 확인할 수 없는 규칙은 테스트로 고정했습니다.

```bash
npm test           # Vitest — 6개 파일 · 41개 테스트
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

## 미션 요구사항 대응

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
| 테스트 | Vitest 41개 (검증 규칙 · 데이터 계층 · 컴포넌트) |
| 접근성 | 모달 포커스 트랩/초기 포커스, `aria-*` 연결, 키보드 탐색 |
| 반응형 | 모바일 퍼스트 · 390px 가로 스크롤 0 |

---

## 안내

본 저장소와 페이지는 **학습 목적**이며 실제 상용 서비스가 아닙니다.
회원가입·결제·채용 중개를 제공하지 않고, 화면에 보이는 기업·공고·지원자 정보는
모두 학습용 가상 데이터입니다. 입력한 값은 서버로 전송되지 않고 사용자의 브라우저에만 저장됩니다.
