# Linkple

> **채용부터 복지까지, 사람과 일을 잇다.**
> 통합 HR 플랫폼 **Linkple(링플)** — 코드잇 스프린트 · IT창업가 과정 스프린트 미션 저장소입니다.

구인기업 · 구직자 · 전문 파트너를 연결하는 채용과, 입사부터 퇴직까지의 임직원 총보상(복지)을
하나의 흐름으로 잇는 서비스를 단계별로 만들어 갑니다.

---

## 미션별 산출물

| 미션 | 내용 | 라이브 데모 | 코드 |
|---|---|---|---|
| **미션 5** | 창업 아이템 랜딩 페이지 — 순수 HTML · CSS · JavaScript | [linkple-landing.vercel.app](https://linkple-landing.vercel.app) | [`feature/mission5`](../../tree/feature/mission5) · [PR #2](../../pull/2) |
| **미션 6** | 프론트엔드 MVP — React 19 · React Router 7 · Vite | [linkple-mvp.vercel.app](https://linkple-mvp.vercel.app) | [`feature/mission6`](../../tree/feature/mission6) |

각 미션의 상세 설명은 **해당 브랜치의 `README.md`** 에 있습니다.

---

## 브랜치 전략

미션마다 별도 브랜치를 파고 **Pull Request로 제출**합니다.
`main`은 멘토 리뷰가 끝난 산출물을 병합해 두는 자리라, 리뷰 진행 중에는 비어 있을 수 있습니다.
**작업물은 위 표의 브랜치·PR 링크에서 보실 수 있습니다.**

---

## 기술 스택 변화

| | 미션 5 | 미션 6 |
|---|---|---|
| 렌더링 | 정적 HTML | React 19 (SPA) |
| 라우팅 | 앵커 스크롤 | React Router 7 (8개 라우트) |
| 스타일 | 순수 CSS | CSS Modules + 디자인 토큰 *(미션 5에서 승계)* |
| 데이터 | 없음 | localStorage · JSON Server Mock API |
| 빌드 | 없음 | Vite 6 |
| 배포 | Vercel | Vercel |

---

## 안내

본 저장소는 **학습 목적**이며 실제 상용 서비스가 아닙니다.
회원가입 · 결제 · 채용 중개를 제공하지 않으며, 화면에 보이는 기업 · 공고 · 지원자 정보는
모두 학습용 가상 데이터입니다.
