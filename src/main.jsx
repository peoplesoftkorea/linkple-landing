import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import ToastProvider from "./contexts/ToastProvider";
import AuthProvider from "./contexts/AuthProvider";
import JobsProvider from "./contexts/JobsProvider";
import "./styles/global.css";
import { initAnalytics } from "./lib/analytics";

// ★계측 초기화는 «렌더 전»에 한 번. UTM 은 첫 진입 쿼리에만 있어서 늦으면 유입 경로를 놓친다.
initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <JobsProvider>
              <App />
            </JobsProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
