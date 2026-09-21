import { Route, Routes } from "react-router-dom";
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

/**
 * 화면 지도.
 * 홈 → 공고 목록 → 상세 → (로그인) → 지원 → 완료 → 내 지원 내역으로 이어지는
 * 하나의 흐름을 라우트로 그대로 옮겼다.
 */
export default function App() {
  return (
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
  );
}
