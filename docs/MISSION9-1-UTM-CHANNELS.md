# 미션 9-1 — UTM 채널 설계와 홍보 링크

> 대상 URL: `https://linkple-mission8.vercel.app`
> 짝 문서 [지표 설계](./MISSION9-1-METRICS.md) · [Tracking Plan](./MISSION9-1-TRACKING-PLAN.md)

---

## 1. 발신 대상을 IF3 과정 안으로 한정한다

**이 앱은 학습용 데모다.** 실제 채용 서비스가 아니고, 데모 계정이 공개돼 있어 누구나 공고를 등록하고
삭제할 수 있다. 그래서 불특정 다수나 업무 관계자에게 보내지 않는다.

| 후보 | 판정 |
|---|---|
| 업무 관계자(파트너, 고객사) | 🔴보내지 않는다 — 학습물을 업무 신용으로 알리는 셈이 된다 |
| 일반 지인 | ⚠️맥락이 없어 피드백이 나오지 않는다 |
| **IF3 과정 안(동기, 멘토)** | ✅같은 미션을 하는 사람들이라 맥락이 통하고, 서로 눌러주는 것이 이 미션의 정상 동선이다 |

★**대상은 하나로 좁히고, «도달 경로»를 셋으로 나눈다.** 같은 사람이라도 카톡에서 누를 때와
노션에서 누를 때는 다른 유입이다. UTM 이 구분하려는 것이 바로 그 차이다.

---

## 2. 택소노미

| 파라미터 | 값 | 뜻 |
|---|---|---|
| `utm_source` | `kakao` / `discord` / `notion` | 어느 경로로 왔나 |
| `utm_medium` | `group_chat` / `community` / `submission` | 어떤 성격의 자리였나 |
| `utm_campaign` | `mission9_launch` | 이 홍보 묶음 |
| `utm_content` | `text_only` / `with_card` / `mentor_review` | 어떤 형태로 노출됐나 |

규칙 셋
1. **전부 소문자와 밑줄**만 쓴다. GA4 는 `Kakao` 와 `kakao` 를 다른 채널로 측정한다.
2. `utm_source` 는 경로 이름 하나로 고정한다. 같은 경로를 두 이름으로 적으면 합산이 불가능해진다.
3. `utm_content` 로 형태를 구분한다. 같은 경로에서도 문자만 보낸 것과 이미지를 붙인 것은 결과가 다르다.

---

## 3. 경로별 링크 (그대로 복사해 씁니다)

### 경로 1. 카카오톡 — 과정 동기 단톡방
```
https://linkple-mission8.vercel.app/?utm_source=kakao&utm_medium=group_chat&utm_campaign=mission9_launch&utm_content=text_only
```

### 경로 2. 디스코드 — 과정 커뮤니티 채널
```
https://linkple-mission8.vercel.app/?utm_source=discord&utm_medium=community&utm_campaign=mission9_launch&utm_content=with_card
```

### 경로 3. 노션 — 미션 제출란의 배포 URL
```
https://linkple-mission8.vercel.app/?utm_source=notion&utm_medium=submission&utm_campaign=mission9_launch&utm_content=mentor_review
```

★**경로 3이 가장 확실한 유입이다** — 멘토는 피드백을 위해 반드시 배포본을 연다. 제출란에
UTM 을 붙인 주소를 적어 두면 그 방문이 어디서 온 것인지 구분된다.

---

## 4. 경로별 문안

### 카카오톡 (동기 단톡방)
```
미션 9-1 로깅 붙여서 배포했습니다. 공고 등록 눌러보면 AI가 초안 잡아주고, 지원까지 한 화면에서 됩니다.
서로 눌러주면 데이터 쌓이니까 필요하신 분은 제 것도 눌러주세요.
https://linkple-mission8.vercel.app/?utm_source=kakao&utm_medium=group_chat&utm_campaign=mission9_launch&utm_content=text_only
```

### 디스코드 (과정 커뮤니티)
```
미션 9-1 배포했습니다. Amplitude와 GA4 둘 다 붙였고 이벤트 13종 찍히는 것까지 확인했습니다.
공고 등록 화면의 AI 초안이 제일 볼 만합니다. 직무 한 줄만 넣으면 폼이 채워집니다.
눌러보시고 이상한 점 있으면 알려주세요.
https://linkple-mission8.vercel.app/?utm_source=discord&utm_medium=community&utm_campaign=mission9_launch&utm_content=with_card
```

### 노션 (미션 제출란 배포 URL 칸)
UTM 을 붙인 주소를 그대로 적는다. 별도 문안은 필요 없다.

---

## 5. 발신 전 점검 셋

1. 링크를 직접 눌러 200 이 뜨는지 본다.
2. 들어간 뒤 브라우저 콘솔에서 `window.__LOG_QA[0].props` 를 보고 UTM 이 실렸는지 확인한다.
3. 같은 자리에 같은 말을 두 번 보내지 않는다. 보낸 기록을 아래에 남긴다.

⚠️링크 단축 서비스를 쓰면 파라미터가 살아 있는지 반드시 확인한다. 일부 단축기는 쿼리를 떼어
버리고, 그러면 모든 유입이 `direct` 로 떨어진다.

---

## 6. 발신 기록

| 일시 | 경로 | 소재 | 결과 |
|---|---|---|---|
| (발신 후 기재) | | | |
