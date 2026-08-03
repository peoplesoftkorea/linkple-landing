# Linkple — 랜딩 페이지

> **채용부터 복지까지, 사람과 일을 잇다.** 통합 HR 플랫폼 Linkple의 **컨셉 소개 랜딩 페이지**입니다.
> 코드잇 스프린트 · IT창업가 과정 **스프린트 미션 5**(창업 아이템 랜딩 페이지) 제출물.

**🔗 라이브 데모: https://linkple-landing.vercel.app**

## 개요

순수 **HTML · CSS · JavaScript**만으로 만든 정적 랜딩 페이지입니다. 기획 → 디자인 → 개발 → 배포의 전체 흐름을 담았습니다.

- **아이템**: Linkple — 채용(3자 매칭) + 임직원 복지몰(총보상)을 잇는 통합 HR 플랫폼
- **상태**: 출시 예정 서비스의 **컨셉 소개**(실제 서비스·가입·결제·중개 없음)

## 구성

| 섹션 | 내용 |
|---|---|
| Hero | 핵심 가치 · CTA |
| 문제 → 해결 | 흩어진 HR을 하나의 흐름으로 |
| 기능 | 3자 채용 매칭 · 복지몰 · 데이터 통합 · 자동화 |
| 기대효과 | 타깃(HR 담당자) · 효과 |
| CTA | 출시 알림 신청(컨셉 데모) |

## 구현 포인트

- **시맨틱 마크업** (`header`/`main`/`section`/`footer`)
- **반응형** — 미디어 쿼리로 모바일·데스크탑 대응, 모바일 메뉴 토글
- **레이아웃** — CSS Grid / Flexbox
- **인터랙션(JS)** — 스크롤 리빌(IntersectionObserver) · 호버 효과 · CTA 모달 피드백
- **접근성** — `alt`/`aria`, 키보드 탐색, `:focus-visible`, `prefers-reduced-motion`, skip-link
- **브랜드** — Aurora Green 컬러 시스템, Pretendard 타이포그래피

## 폴더 구조

```
linkple-landing/
├── index.html      ← 최상위 진입점
├── css/style.css
└── js/main.js
```

## 배포

Vercel로 배포합니다. (정적 사이트 → 별도 빌드 없이 그대로 배포)

- **배포 주소**: https://linkple-landing.vercel.app

## 안내

본 저장소·페이지는 **학습 및 컨셉 소개 목적**이며, 실제 상용 서비스가 아닙니다.
