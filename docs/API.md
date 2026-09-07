# Linkple MVP API

미션7 백엔드. 미션6의 프론트엔드가 이 API를 읽고 쓴다.

## 기능 선별 — 무엇이 서버로 갔고, 무엇이 남았나

미션6 기능 중 **여러 사용자가 같은 데이터를 봐야 하는 것**만 서버로 옮겼다.

| 서버로 간 것 | 이유 |
|---|---|
| 공고 (조회·등록·삭제) | A가 올린 공고를 B가 봐야 한다 — 브라우저 저장소로는 불가능 |
| 지원 (접수·내역·철회) | 중복 지원 차단은 서버만 보장할 수 있다 (`@@unique`) |
| 인증 (가입·로그인) | "누가 등록했나"를 믿으려면 토큰이 서버에서 발급되어야 한다 |
| 사전 신청 | 신청 집계는 한 곳에 모여야 의미가 있다 |

| 브라우저에 남은 것 | 이유 |
|---|---|
| 검색·필터·정렬 상태 | URL 쿼리가 이미 정본 — 서버가 알 필요 없다 |
| 로그인 토큰 보관 | 세션 유지는 클라이언트의 일. 판정은 매 요청 서버가 다시 한다 |

- 기본 주소: 배포본은 같은 오리진의 `/api`, 로컬은 `http://localhost:3001`
- 모든 요청·응답은 `application/json`
- 인증이 필요한 곳은 `Authorization: Bearer <token>`

## 상태 코드 규약

| 코드 | 뜻 |
|---|---|
| 200 | 조회·수정 성공 |
| 201 | 생성 성공 |
| 204 | 성공했고 돌려줄 본문이 없음(삭제) |
| 400 | 입력이 규칙에 맞지 않음 |
| 401 | 로그인이 필요하거나 토큰이 만료됨 |
| 403 | 로그인은 했으나 그 일을 할 권한이 없음 |
| 404 | 대상이 없음 |
| 409 | 이미 있는 것과 부딪힘(중복 지원·중복 이메일) |
| 500 | 서버 문제 |

에러는 언제나 같은 모양이다. `message` 는 **사용자에게 그대로 보여줄 수 있는 문장**이다.

```json
{ "message": "이미 이 공고에 지원하셨습니다.", "field": "email" }
```

---

## 인증

### `POST /auth/signup`
```json
{ "email": "me@company.com", "password": "6자이상", "name": "홍길동", "company": "회사명(선택)" }
```
→ `201` `{ "user": { "id", "email", "name", "company" }, "token": "..." }`
→ `409` 이미 가입된 이메일 · `400` 형식 오류

### `POST /auth/login`
```json
{ "email": "demo@linkple.kr", "password": "linkple2026" }
```
→ `200` `{ "user": {...}, "token": "..." }`
→ `401` 이메일 또는 비밀번호가 올바르지 않습니다.

> 계정이 없는 것과 비밀번호가 틀린 것을 **구분해 알려주지 않는다.** 구분해 주면
> "이 이메일은 가입돼 있다"는 사실이 새어 나간다.

### `GET /auth/me` 🔒
→ `200` `{ "user": {...} }` · `401` 토큰 없음·만료·위조

---

## 공고

### `GET /jobs`
| 쿼리 | 뜻 | 기본값 |
|---|---|---|
| `q` | 제목·회사·근무지 검색(대소문자 무시) | — |
| `category` | 직군 | 전체 |
| `employmentType` | 고용 형태 | 전체 |
| `sort` | `latest` \| `salary` \| `title` | `latest` |
| `page` / `pageSize` | 페이지 번호 / 크기(최대 100) | 1 / 20 |

→ `200` `{ "total": 10, "page": 1, "pageSize": 20, "jobs": [ { ..., "_count": { "applications": 2 } } ] }`

> 목록에는 지원자 **수**만 싣는다. 지원 내역을 통째로 실으면 응답이 커지고,
> 목록 화면은 그 내용을 쓰지도 않는다.

### `GET /jobs/:id`
→ `200` 공고 + `author`(작성자 요약) + `_count.applications` · `404` 없음

### `POST /jobs` 🔒
```json
{
  "title": "5~60자", "company": "…", "location": "…",
  "category": "개발", "employmentType": "정규직",
  "salary": 6500, "description": "20자 이상",
  "requirements": ["…"], "benefits": ["…"]
}
```
→ `201` 만들어진 공고 · `400` 규칙 위반 · `401` 토큰 없음

> `id` · `createdAt` · `source` 는 **보내지 않는다.** 서버가 정한다.
> `category` · `employmentType` 은 정해진 값만 받는다(그 외 400).

### `DELETE /jobs/:id` 🔒
→ `204` · `403` 내가 올린 공고가 아님 · `404` 없음

> 딸린 지원 내역은 스키마의 `onDelete: Cascade` 가 함께 정리한다.
> 클라이언트가 하나씩 지우던 미션6 방식은 중간에 창을 닫으면 고아가 남았다.

---

## 지원

### `POST /applications`
로그인 없이 가능하다 — 구직자는 계정을 만들기 전에 먼저 지원한다.
```json
{ "jobId": "…", "name": "2자이상", "email": "…", "phone": "010-1234-5678", "message": "500자 이내" }
```
→ `201` 지원서 + `job` 요약
→ `409` 이미 이 공고에 지원함 · `404` 공고 없음 · `400` 형식 오류

### `GET /applications` 🔒
내가 **낸** 지원서(로그인 계정 이메일 기준). → `200` 배열

> 거르는 일은 서버가 한다. 프론트에서 거르면 남의 지원서가 응답에 실려 나간 뒤
> 화면에서만 숨겨진다.

### `GET /applications/received` 🔒
내가 **올린 공고에 들어온** 지원. → `200` 배열

### `DELETE /applications/:id` 🔒
→ `204` · `403` 본인이 낸 지원서가 아님 · `404` 없음
철회 후 같은 공고에 다시 지원할 수 있다.

---

## 사전 신청

### `POST /waitlist`
```json
{ "email": "…", "company": "선택" }
```
→ `201`. 같은 이메일로 다시 눌러도 실패로 만들지 않는다 — 신청자에게 "이미 했다"는
것은 실패가 아니라 이미 이룬 상태다.

---

## 데이터 모델

```
User 1──N Job 1──N Application
             │
        onDelete
  User 삭제 → Job.authorId = NULL   (SetNull — 공고는 남긴다)
  Job  삭제 → Application 삭제      (Cascade — 부모 없는 지원은 뜻이 없다)
```

- `Application` 에 `@@unique([jobId, email])` — 같은 공고 중복 지원을 **DB가** 막는다.
  애플리케이션이 잊어도 데이터는 지켜진다.
- `Job.salary` 는 만원 단위 정수. 비어 있으면 "협의".

## 검증

입력 규칙은 프론트(`src/lib/validate.js`)와 서버(`server/validate.js`)에 **같은 값으로 두 번** 있다.
중복이지만 목적이 다르다 — **프론트 검증은 사용자를 돕고, 서버 검증은 데이터를 지킨다.**
브라우저를 거치지 않고 API를 직접 부르는 요청은 프론트 검증을 통과한 적이 없다.

## 환경 변수

| 이름 | 쓰임 |
|---|---|
| `DATABASE_URL` | PostgreSQL 접속 주소 |
| `JWT_SECRET` | 토큰 서명 키. **운영에서 없으면 서버가 뜨지 않는다** |
| `JWT_EXPIRES_IN` | 토큰 유효기간(기본 `2h`) |
| `VITE_API_BASE_URL` | 프론트가 부를 API 주소. 비우면 같은 오리진 `/api` |

## 로컬에서 돌려보기

```bash
npm install
cp .env.example .env          # DATABASE_URL 을 자기 환경에 맞게
npm run db:migrate            # 테이블 생성
npm run db:seed               # 공고 10건 + 데모 계정
npm run api                   # API   http://localhost:3001
npm run dev                   # 화면  http://localhost:5173
```

데모 계정: `demo@linkple.kr` / `linkple2026`
