import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * 로그인이 필요한 화면을 감싼다.
 * 되돌아올 주소를 state.from에 실어 보내, 로그인 직후 원래 하려던 일로 복귀시킨다.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }

  return <Outlet />;
}
