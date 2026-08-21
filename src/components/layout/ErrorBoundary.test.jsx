import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Boom() {
  throw new Error("공고를 그리다 터졌습니다");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React가 경계에서 잡은 예외를 콘솔에 다시 던지므로, 테스트 출력만 조용히 시킨다.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("문제가 없으면 자식을 그대로 보여준다", () => {
    render(
      <ErrorBoundary>
        <p>정상 화면</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("정상 화면")).toBeInTheDocument();
  });

  it("자식이 터져도 흰 화면 대신 복구 안내를 보여준다", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "화면을 표시하지 못했습니다" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "새로고침" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈으로" })).toBeInTheDocument();
  });

  it("무슨 오류였는지 감추지 않는다", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("공고를 그리다 터졌습니다")).toBeInTheDocument();
  });

  it("저장된 데이터는 무사하다고 알린다", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/저장된 공고와 지원 내역은 그대로 남아 있습니다/)).toBeInTheDocument();
  });
});
