# Linkple — 프론트엔드 MVP

> **채용부터 복지까지, 사람과 일을 잇다.** 통합 HR 플랫폼 Linkple의 **프론트엔드 MVP**입니다.
> 코드잇 스프린트 · IT창업가 과정 **스프린트 미션 6**(프론트엔드 MVP 구현) 제출물.

**🔗 라이브 데모: https://linkple-mvp.vercel.app**
**🔗 미션 5 정적 랜딩(디자인 원본): https://linkple-landing.vercel.app**

---

## 이번 미션에서 한 일

미션 5에서 순수 HTML·CSS·JS로 만든 **정적 랜딩 페이지**를, 사용자가 직접 써볼 수 있는
**React 기반 MVP**로 옮겼습니다. 보여주기 위한 화면에서 멈추지 않고, 공고를 올리고 찾고
지원하는 일이 실제로 **동작하고 저장되는** 수준까지 구현했습니다.

백엔드는 쓰지 않습니다. 데이터는 **localStorage**에 남고, 새로고침해도 사라지지 않습니다.

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
                      ↘ 공고 등록(로그인 필요) → 등록한 공고 상세
```

로그인이 필요한 화면에 비로그인 상태로 들어가면 로그인 페이지로 보내고,
로그인 직후 **원래 하려던 화면으로 되돌립니다.**

---

## 화면 · 라우트

| 경로 | 화면 | 보호 |
|---|---|---|
| `/` | 홈 (히어로 · 흐름 소개 · 실시간 지표) | — |
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
- **localStorage** — 백엔드 대체 영속 계층

상태 관리는 **`useState` · `useReducer` · `useMemo` · `useCallback` + Context** 만 사용했습니다.
외부 상태 관리 라이브러리는 쓰지 않았습니다.

| Context | 역할 |
|---|---|
| `AuthProvider` | 로그인 상태 시뮬레이션 · 세션 영속 |
| `JobsProvider` | 공고·지원 데이터 (`useReducer`) · 저장소 동기화 · 로딩/에러 상태 |
| `ToastProvider` | 결과 알림 (자동 소멸) |

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

### UX 상태 처리

- **로딩** — 카드와 같은 골격의 스켈레톤 6장 (화면이 튀지 않음)
- **빈 화면** — "등록된 공고 없음"과 "조건에 맞는 공고 없음"을 구분해 다른 행동을 제안
- **에러** — 저장소를 쓸 수 없을 때 사유와 **다시 시도** 버튼 제시
- **검증** — 필드별 메시지 + 제출 시 오류 요약(포커스 이동)

### 접근성

`skip-link` · `:focus-visible` · `aria-live` · `aria-invalid`/`aria-describedby` ·
`aria-expanded`/`aria-controls` · `aria-pressed` · `role="dialog"` 포커스 트랩 ·
`prefers-reduced-motion` 대응. 모바일 퍼스트로 작성했고, 390px에서 가로 스크롤이 발생하지 않습니다.

---

## 폴더 구조

```
src/
├── main.jsx                  # 진입점 · Provider 조립
├── App.jsx                   # 라우트 정의
├── styles/                   # tokens.css · global.css
├── data/                     # constants.js · seedJobs.js (Mock 데이터 10건)
├── lib/                      # storage.js · validate.js · format.js · id.js
├── contexts/                 # Auth · Jobs · Toast (Provider + Context 분리)
├── hooks/                    # useAuth · useJobs · useToast
├── components/
│   ├── ui/                   # 디자인 시스템 (Button · Field · Card · Modal · …)
│   ├── layout/               # Layout · Header · Footer · ProtectedRoute · …
│   └── job/                  # JobCard · JobFilters · ApplyModal
└── pages/                    # Home · Jobs · JobDetail · JobNew · Applications · ApplyDone · Login · NotFound
```

---

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 확인
npm run lint     # ESLint
```

### 데모 계정

실제 인증은 하지 않습니다. **형식이 맞는 이메일 + 6자 이상 비밀번호**면 로그인됩니다.
로그인 화면의 `데모 계정 채워 넣기` 버튼으로 `hr@linkple.kr / linkple123` 을 바로 넣을 수 있습니다.

> 데이터를 처음 상태로 되돌리려면 브라우저 콘솔에서
> `localStorage.clear()` 후 새로고침하세요.

---

## 미션 요구사항 대응

**기본 요구사항**

| 항목 | 구현 |
|---|---|
| 핵심 기능 2~4개 선정 | 4개 (탐색 · 등록 · 지원 · 지원 관리) |
| 정적 디자인 → React 컴포넌트 | 미션 5 마크업/토큰을 컴포넌트 계층으로 재구성 |
| 재사용 컴포넌트 설계 | `components/ui` 11종 |
| React Router 화면 이동 | 8개 라우트 · 중첩 라우트 · 보호 라우트 |
| 상태 관리 · 상호작용 | `useState`/`useReducer`/Context, 필터·정렬·모달·토글·토스트 |
| 로컬 스토리지 / Mock 데이터 | 시드 10건 + 사용자 등록분, 새로고침 후 유지 |

**심화 요구사항**

| 항목 | 구현 |
|---|---|
| 간단한 인증 흐름 | localStorage 기반 로그인/로그아웃 · 보호 라우트 · 로그인 후 원래 화면 복귀 |
| UX 개선 | 로딩 스켈레톤 · 빈 화면 2종 · 에러 + 재시도 · 폼 검증 · 토스트 |
| 디자인 시스템 | 토큰 + 재사용 UI 컴포넌트로 전 화면 통일 |

---

## 안내

본 저장소와 페이지는 **학습 목적**이며 실제 상용 서비스가 아닙니다.
회원가입·결제·채용 중개를 제공하지 않고, 화면에 보이는 기업·공고·지원자 정보는
모두 학습용 가상 데이터입니다. 입력한 값은 서버로 전송되지 않고 사용자의 브라우저에만 저장됩니다.
