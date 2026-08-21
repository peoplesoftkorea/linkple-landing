import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Button from "./Button";

const renderWithRouter = (ui) => render(ui, { wrapper: MemoryRouter });

describe("Button", () => {
  it("기본은 button 요소로 렌더된다", () => {
    render(<Button>지원하기</Button>);
    expect(screen.getByRole("button", { name: "지원하기" })).toBeInTheDocument();
  });

  it("to를 주면 링크로 렌더된다 — 화면마다 다른 버튼을 만들지 않기 위한 규칙", () => {
    renderWithRouter(<Button to="/jobs">공고 탐색</Button>);
    expect(screen.getByRole("link", { name: "공고 탐색" })).toHaveAttribute("href", "/jobs");
  });

  it("loading이면 비활성화하고 진행 중임을 알린다", () => {
    render(<Button loading>제출 중</Button>);
    const button = screen.getByRole("button", { name: /제출 중/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("loading 상태에서는 클릭이 먹지 않는다 — 중복 제출 방지", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        제출
      </Button>,
    );
    screen.getByRole("button").click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
