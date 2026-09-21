import { describe, expect, it } from "vitest";
import { formatDate, formatRelative, formatSalary, maskEmail } from "./format";

describe("formatSalary", () => {
  it("만원 단위를 천 단위로 끊어 읽는다", () => {
    expect(formatSalary(3800)).toBe("3,800만원");
  });

  it("1억 이상은 억 단위로 바꾼다", () => {
    expect(formatSalary(10000)).toBe("1억원");
    expect(formatSalary(12500)).toBe("1억 2,500만원");
  });

  it("0이나 빈 값은 회사 내규로 표기한다", () => {
    expect(formatSalary(0)).toBe("회사 내규에 따름");
    expect(formatSalary(undefined)).toBe("회사 내규에 따름");
  });
});

describe("formatRelative", () => {
  const iso = (daysAgo) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

  it("오늘·어제·N일 전을 구분한다", () => {
    expect(formatRelative(iso(0))).toBe("오늘");
    expect(formatRelative(iso(1))).toBe("어제");
    expect(formatRelative(iso(3))).toBe("3일 전");
  });

  it("일주일이 넘으면 날짜로 적는다", () => {
    expect(formatRelative(iso(10))).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it("잘못된 값은 화면을 깨뜨리지 않는다", () => {
    expect(formatRelative("깨진값")).toBe("-");
    expect(formatDate(undefined)).toBe("-");
  });
});

describe("maskEmail", () => {
  it("앞 두 글자만 남기고 가린다", () => {
    expect(maskEmail("hrmanager@linkple.kr")).toBe("hr*******@linkple.kr");
  });

  it("도메인이 없으면 그대로 둔다", () => {
    expect(maskEmail("이메일아님")).toBe("이메일아님");
  });
});
