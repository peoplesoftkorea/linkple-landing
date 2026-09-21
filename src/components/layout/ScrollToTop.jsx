import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA에서는 페이지를 옮겨도 스크롤이 그대로 남는다.
 * 새 화면은 늘 맨 위에서 시작하도록 되돌린다.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
