import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobNew from "./pages/JobNew";
import Applications from "./pages/Applications";
import ApplyDone from "./pages/ApplyDone";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { trackPageView } from "./lib/analytics";

/**
 * 화면 지도.
 * 홈 → 공고 목록 → 상세 → (로그인) → 지원 → 완료 → 내 지원 내역으로 이어지는
 * 하나의 흐름을 라우트로 그대로 옮겼다.
 */
/**
 * SPA 는 라우트가 바뀌어도 문서를 다시 열지 않는다 — 그래서 페이지뷰를 «직접» 보낸다.
 * ⛔자동 수집(pageViews)에 맡기지 않는 이유: 어느 경로를 한 화면으로 볼지 우리가 정해야 한다.
 */
function PageViewTracker() {
  const { pathname } = useLocation();
  // ⛔같은 경로를 연달아 보내지 않는다.
  //   🔴실측 2026-09-30 — 개발 모드(StrictMode)의 이중 마운트로 `/` 의 page_view 가 2건 찍혔다.
  //     그대로 두면 **방문자 수가 부풀고**, 그 위에 세운 전환율은 전부 낮게 보인다.
  //     배포본에서도 재마운트가 일어나는 자리가 있어 경로 비교로 막는 편이 안전하다.
  const lastPath = useRef(null);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageView(pathname);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <PageViewTracker />
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:jobId" element={<JobDetail />} />
        <Route path="login" element={<Login />} />

        {/* 로그인이 필요한 화면 */}
        <Route element={<ProtectedRoute />}>
          <Route path="jobs/new" element={<JobNew />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:applicationId/done" element={<ApplyDone />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </>
  );
}
