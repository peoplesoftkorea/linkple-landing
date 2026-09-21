import { useEffect } from "react";

export const BASE_TITLE = "Linkple — 채용부터 복지까지, 사람과 일을 잇다";

/**
 * 화면마다 브라우저 탭 제목을 바꾼다.
 * SPA는 문서가 하나뿐이라 손대지 않으면 8개 화면이 탭에서 전부 같은 이름으로 보인다.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Linkple` : BASE_TITLE;
  }, [title]);
}
