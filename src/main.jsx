import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import ToastProvider from "./contexts/ToastProvider";
import AuthProvider from "./contexts/AuthProvider";
import JobsProvider from "./contexts/JobsProvider";
import "./styles/global.css";

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
