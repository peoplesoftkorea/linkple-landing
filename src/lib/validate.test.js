import { describe, expect, it } from "vitest";
import {
  hasErrors,
  validateApplyForm,
  validateJobForm,
  validateLoginForm,
} from "./validate";

const VALID_JOB = {
  title: "프론트엔드 개발자 (신입)",
  company: "링플",
  location: "서울 마포구",
  category: "개발",
  employmentType: "정규직",
  salary: "3800",
  description: "React로 HR 플랫폼 화면을 만듭니다. 공통 컴포넌트를 쌓습니다.",
};

describe("validateJobForm", () => {
  it("모든 값이 갖춰지면 통과한다", () => {
    expect(hasErrors(validateJobForm(VALID_JOB))).toBe(false);
  });

  it("제목이 짧으면 막는다", () => {
    expect(validateJobForm({ ...VALID_JOB, title: "짧음" }).title).toMatch(/5자 이상/);
  });

  it("담당 업무가 20자 미만이면 현재 글자수를 알려준다", () => {
    const errors = validateJobForm({ ...VALID_JOB, description: "짧은 설명" });
    expect(errors.description).toMatch(/20자 이상/);
    expect(errors.description).toMatch(/5자/);
  });

  it("연봉은 비워도 되지만 음수·과대값은 막는다", () => {
    expect(validateJobForm({ ...VALID_JOB, salary: "" }).salary).toBeUndefined();
    expect(validateJobForm({ ...VALID_JOB, salary: "-1" }).salary).toBeDefined();
    expect(validateJobForm({ ...VALID_JOB, salary: "999999" }).salary).toMatch(/만원 단위/);
  });

  it("필수 선택지를 비우면 각각 지적한다", () => {
    const errors = validateJobForm({ ...VALID_JOB, category: "", employmentType: "" });
    expect(errors.category).toBeDefined();
    expect(errors.employmentType).toBeDefined();
  });
});

describe("validateApplyForm", () => {
  const VALID = { name: "오보영", email: "hr@linkple.kr", phone: "", message: "" };

  it("이름과 이메일만 있으면 통과한다", () => {
    expect(hasErrors(validateApplyForm(VALID))).toBe(false);
  });

  it.each(["hr@bad", "hr.linkple.kr", "@linkple.kr", "hr@linkple."])(
    "잘못된 이메일 %s 을 막는다",
    (email) => {
      expect(validateApplyForm({ ...VALID, email }).email).toBeDefined();
    },
  );

  it("연락처는 선택이지만 형식은 지킨다", () => {
    expect(validateApplyForm({ ...VALID, phone: "" }).phone).toBeUndefined();
    expect(validateApplyForm({ ...VALID, phone: "010-1234-5678" }).phone).toBeUndefined();
    expect(validateApplyForm({ ...VALID, phone: "01012345678" }).phone).toBeUndefined();
    expect(validateApplyForm({ ...VALID, phone: "12345" }).phone).toMatch(/형식/);
  });

  it("지원 메시지는 500자를 넘길 수 없다", () => {
    expect(validateApplyForm({ ...VALID, message: "가".repeat(501) }).message).toBeDefined();
    expect(validateApplyForm({ ...VALID, message: "가".repeat(500) }).message).toBeUndefined();
  });
});

describe("validateLoginForm", () => {
  it("6자 미만 비밀번호를 막는다", () => {
    const errors = validateLoginForm({ email: "hr@linkple.kr", password: "12345" });
    expect(errors.password).toMatch(/6자 이상/);
  });

  it("올바른 값이면 통과한다", () => {
    expect(hasErrors(validateLoginForm({ email: "hr@linkple.kr", password: "linkple123" }))).toBe(
      false,
    );
  });
});
