import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobCard from "./JobCard";

const JOB = {
  id: "job_1",
  title: "HR 매니저",
  company: "그로우테크",
  location: "서울 강남구",
  category: "경영지원·인사",
  employmentType: "정규직",
  salary: 5200,
  description: "채용을 설계하고 실행합니다.",
  createdAt: new Date().toISOString(),
  source: "seed",
};

const renderCard = (props) =>
  render(<JobCard {...props} />, { wrapper: MemoryRouter });

describe("JobCard", () => {
  it("공고의 핵심 정보를 모두 보여준다", () => {
    renderCard({ job: JOB });

    expect(screen.getByRole("heading", { name: "HR 매니저" })).toBeInTheDocument();
    expect(screen.getByText("그로우테크")).toBeInTheDocument();
    expect(screen.getByText("서울 강남구")).toBeInTheDocument();
    expect(screen.getByText("5,200만원")).toBeInTheDocument();
    expect(screen.getByText("오늘")).toBeInTheDocument();
  });

  it("상세로 가는 링크에 무엇을 여는지 적어 둔다", () => {
    renderCard({ job: JOB });

    const link = screen.getByRole("link", { name: "그로우테크 HR 매니저 상세 보기" });
    expect(link).toHaveAttribute("href", "/jobs/job_1");
  });

  it("연봉이 없으면 회사 내규로 표기한다", () => {
    renderCard({ job: { ...JOB, salary: 0 } });
    expect(screen.getByText("회사 내규에 따름")).toBeInTheDocument();
  });

  it("이미 지원한 공고는 배지로 알려 준다", () => {
    renderCard({ job: JOB, applied: true });
    expect(screen.getByText("지원함")).toBeInTheDocument();
  });

  it("직접 등록한 공고는 구분해 표시한다", () => {
    renderCard({ job: { ...JOB, source: "user" } });
    expect(screen.getByText("내가 등록")).toBeInTheDocument();
  });
});
