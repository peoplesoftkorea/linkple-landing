# 미션 9-1 — UTM 채널·소재 설계와 홍보 링크

> 대상 URL: `https://linkple-mission8.vercel.app`
> 짝 문서 [지표 설계](./MISSION9-1-METRICS.md) · [Tracking Plan](./MISSION9-1-TRACKING-PLAN.md)

---

## 1. 택소노미 — 먼저 정하고 그 다음 만든다

| 파라미터 | 무엇을 담나 | 허용 값(이 미션) |
|---|---|---|
| `utm_source` | **어디에서** 왔나(매체 이름) | `kakao` · `naver_blog` · `instagram` |
| `utm_medium` | **어떤 방식**으로 왔나 | `dm`(대화·메시지) · `blog`(글) · `sns`(피드) |
| `utm_campaign` | **어떤 목적**의 묶음인가 | `mission9_launch` |
| `utm_content` | **어느 소재**였나 | `text_only` · `card_seeker` · `card_employer` |

★규칙 3가지
1. **전부 소문자·밑줄**만 쓴다. GA4 는 `Kakao` 와 `kakao` 를 다른 채널로 측정한다.
2. `utm_source` 는 **매체 이름 하나**로 고정한다. 같은 매체를 두 이름으로 적으면 합산이 불가능해진다.
3. `utm_content` 로 **소재를 구분한다** — 같은 채널에서도 어떤 그림·문구가 먹혔는지가 다음 홍보를 바꾼다.

---

## 2. 홍보 링크 (그대로 복사해 씁니다)

### 채널 1. 카카오톡 — 지인·단체방에 메시지
```
https://linkple-mission8.vercel.app/?utm_source=kakao&utm_medium=dm&utm_campaign=mission9_launch&utm_content=text_only
```

### 채널 2. 네이버 블로그 — 글 본문 링크
```
https://linkple-mission8.vercel.app/?utm_source=naver_blog&utm_medium=blog&utm_campaign=mission9_launch&utm_content=card_seeker
```

### 채널 3. 인스타그램 — 프로필 링크·스토리
```
https://linkple-mission8.vercel.app/?utm_source=instagram&utm_medium=sns&utm_campaign=mission9_launch&utm_content=card_employer
```

### (보조) 공고 목록으로 바로 보내는 변형 — 첫 화면을 건너뛰면 전환이 오르는지 비교용
```
https://linkple-mission8.vercel.app/jobs?utm_source=kakao&utm_medium=dm&utm_campaign=mission9_launch&utm_content=direct_to_list
```

⚠️링크를 줄이는 서비스(비틀리 등)를 쓰면 **파라미터가 살아 있는지 반드시 확인**한다. 일부 단축기는
쿼리를 떼어 버리고, 그러면 모든 유입이 `direct` 로 떨어진다.

---

## 3. 홍보 문안 초안 — 채널마다 읽는 자리가 다르다

### 카카오톡(소재 `text_only`) — 대화창에서 두 줄로 읽힌다
```
채용 공고 올리고 지원받는 걸 한 화면에서 해보는 연습용 서비스를 만들었습니다.
공고 등록은 AI가 초안을 잡아줍니다. 한 번 눌러보고 이상한 점 알려주시면 고칩니다.
https://linkple-mission8.vercel.app/?utm_source=kakao&utm_medium=dm&utm_campaign=mission9_launch&utm_content=text_only
```

### 네이버 블로그(소재 `card_seeker`) — 구직자 관점
```
제목: 공고를 찾는 쪽에서 본 채용 서비스 — 무엇이 불편했고 어떻게 줄였나

본문 요지
- 공고 목록에서 급여와 지역이 먼저 보이게 했습니다.
- 지원은 한 화면에서 끝냅니다. 이력서 파일을 요구하지 않습니다.
- 직접 눌러보실 수 있습니다: (링크)
```

### 인스타그램(소재 `card_employer`) — 구인자 관점·이미지 1장
```
캡션
공고 문구 쓰는 데 30분 쓰던 걸, 직무 한 줄만 넣으면 초안이 나옵니다.
고쳐서 올리면 끝. 프로필 링크에서 바로 해보세요.
#채용 #공고작성 #AI
```
⚠️인스타그램은 캡션의 링크가 눌리지 않는다 — **프로필 링크**에 넣는다.

---

## 4. 생성형 AI 로 만들 소재 (심화 요구)

| 소재 | 만드는 것 | 붙는 `utm_content` |
|---|---|---|
| 구직자용 카드 | 「공고 목록 화면」을 담은 1:1 이미지 + 한 줄 문구 | `card_seeker` |
| 구인자용 카드 | 「AI 초안 패널」을 담은 1:1 이미지 + 한 줄 문구 | `card_employer` |
| 문자만 | 이미지 없이 문장 2줄 | `text_only` |

★**소재를 3개로 나눈 이유는 비교하기 위해서다.** 하나만 만들면 「어떤 소재가 먹혔나」를 물을 수 없다.

---

## 5. 발신 전 점검 4가지

1. 링크를 **직접 눌러** 200 이 뜨는지 본다(배포본이 살아 있는지).
2. 눌러서 들어간 뒤 브라우저 콘솔에서 `window.__LOG_QA[0].props` 를 보고 **UTM 5종이 실렸는지** 확인한다.
3. GA4 **실시간** 화면에 그 방문이 보이는지 확인한다(측정 ID 가 꽂힌 뒤).
4. 같은 채널에 **같은 말을 두 번 보내지 않는다** — 보낸 기록을 이 문서 아래에 남긴다.

## 6. 발신 기록

| 일시 | 채널 | 소재 | 링크 | 결과 |
|---|---|---|---|---|
| (발신 후 기재) | | | | |
