# 기능 명세서 및 유저플로우 — 원본

코드잇 스프린트 미션 6 제출 문서의 **원본 소스**입니다.
제출본(구글 문서)은 이 파일들로 만들었습니다.

| 파일 | 내용 |
|---|---|
| `functional-spec.html` | 명세서 본문 (범위 · 사용자 · 화면 8 · 기능 명세 FR-01~07 · 데이터 모델 · 유저 플로우 · 비기능 · 검증) |
| `flow-1-apply.svg` / `.png` | 유저 플로우 A — 공고를 찾아 지원한다 |
| `flow-2-posting.svg` / `.png` | 유저 플로우 B — 공고를 등록하고 관리한다 |

브라우저로 `functional-spec.html`을 열면 도식까지 그대로 보입니다.

## 도식을 고칠 때

SVG를 직접 수정한 뒤 PNG로 다시 굽습니다. 브라우저 없이 변환됩니다.

```bash
rsvg-convert -w 2100 flow-1-apply.svg -o flow-1-apply.png
rsvg-convert -w 2100 flow-2-posting.svg -o flow-2-posting.png
```

> 도식을 텍스트(ASCII 아트)로 그리면 **한글은 글자 폭이 달라 박스 정렬이 무너집니다.**
> 처음엔 그렇게 만들었다가 전부 다시 그렸습니다. SVG로 그리는 편이 결국 빠릅니다.

## 구글 문서로 올릴 때

PNG를 base64 `data:` URI로 바꿔 HTML에 심으면, 드라이브 HTML 임포트가 이미지를 그대로
가져갑니다. 드라이브에 따로 올려 공개 링크를 만들 필요가 없습니다.
