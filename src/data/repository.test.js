import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataSource, repository } from "./repository";
import { STORAGE_KEYS, writeStorage } from "../lib/storage";

/**
 * 미션7부터 저장소는 실제 API다.
 * 네트워크를 대신 세워 두고, 이 계층이 맡은 두 가지 일을 검사한다.
 *  ① 무엇을 보내는가 (보내면 안 되는 것을 빼는가)
 *  ② 받은 것을 화면이 쓰던 모양으로 옮기는가
 */

const ok = (body, status = 200) =>
  Promise.resolve({ ok: true, status, json: () => Promise.resolve(body) });
const fail = (status, body) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) });

const SERVER_JOB = {
  id: "cuid_1",
  title: "HR 매니저",
  company: "그로우테크",
  location: "서울",
  category: "경영지원·인사",
  employmentType: "정규직",
  salary: null,
  description: "설명",
  requirements: null,
  benefits: null,
  createdAt: "2026-08-20T00:00:00.000Z",
  author: { email: "demo@linkple.kr" },
};

const SERVER_APP = {
  id: "app_1",
  jobId: "cuid_1",
  name: "김지원",
  email: "jiwon@example.com",
  phone: null,
  message: null,
  status: "RECEIVED",
  createdAt: "2026-08-22T00:00:00.000Z",
  job: { id: "cuid_1", title: "HR 매니저", company: "그로우테크" },
};

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe("repository (API 모드)", () => {
  it("배포 기본값은 API 모드다", () => {
    expect(dataSource).toBe("api");
  });

  it("목록 응답의 껍데기를 벗기고 빈 값을 메운다", async () => {
    fetch.mockReturnValueOnce(ok({ total: 1, jobs: [SERVER_JOB] }));

    const { jobs, applications } = await repository.loadAll();

    expect(jobs).toHaveLength(1);
    expect(jobs[0].salary).toBe(0);            // null → 0 (화면이 숫자를 기대한다)
    expect(jobs[0].requirements).toEqual([]);  // null → []
    expect(jobs[0].createdBy).toBe("demo@linkple.kr");
    // 로그인하지 않았으면 지원 내역은 부르지도 않는다
    expect(applications).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("로그인 상태면 지원 내역까지 불러 화면 모양으로 옮긴다", async () => {
    writeStorage(STORAGE_KEYS.auth, { token: "t", email: "jiwon@example.com" });
    fetch.mockReturnValueOnce(ok({ jobs: [SERVER_JOB] })).mockReturnValueOnce(ok([SERVER_APP]));

    const { applications } = await repository.loadAll();

    expect(applications[0].jobTitle).toBe("HR 매니저");   // 중첩된 job 을 펼친다
    expect(applications[0].status).toBe("접수 완료");      // RECEIVED → 한글
    expect(applications[0].applicantEmail).toBe("jiwon@example.com");
  });

  it("지원 내역만 실패해도 목록 화면은 살아 있다", async () => {
    writeStorage(STORAGE_KEYS.auth, { token: "만료된토큰" });
    fetch.mockReturnValueOnce(ok({ jobs: [SERVER_JOB] })).mockReturnValueOnce(fail(401, { message: "만료" }));

    const { jobs, applications } = await repository.loadAll();

    expect(jobs).toHaveLength(1);
    expect(applications).toEqual([]);
  });

  it("공고를 만들 때 id·createdAt 을 보내지 않는다 — 그건 서버가 정한다", async () => {
    fetch.mockReturnValueOnce(ok(SERVER_JOB, 201));

    await repository.createJob({
      id: "클라이언트가_만든_id",
      createdAt: "2020-01-01T00:00:00.000Z",
      source: "user",
      title: "HR 매니저",
      company: "그로우테크",
      location: "서울",
      category: "경영지원·인사",
      employmentType: "정규직",
      salary: 5200,
      description: "설명",
      requirements: ["a"],
      benefits: [],
    });

    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent.id).toBeUndefined();
    expect(sent.createdAt).toBeUndefined();
    expect(sent.source).toBeUndefined();
    expect(sent.salary).toBe(5200);
  });

  it("토큰이 있으면 Authorization 헤더에 실어 보낸다", async () => {
    writeStorage(STORAGE_KEYS.auth, { token: "abc123" });
    fetch.mockReturnValueOnce(ok({ jobs: [] }));

    await repository.loadAll();

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer abc123");
  });

  it("서버가 보낸 문장을 그대로 사용자에게 전한다", async () => {
    fetch.mockReturnValueOnce(fail(409, { message: "이미 이 공고에 지원하셨습니다." }));

    await expect(
      repository.createApplication({ jobId: "cuid_1", name: "김지원", email: "a@b.com" }),
    ).rejects.toThrow("이미 이 공고에 지원하셨습니다.");
  });

  it("연결 실패는 서버 오류와 다른 문장으로 알린다", async () => {
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(repository.loadAll()).rejects.toThrow("서버에 연결하지 못했습니다");
  });

  it("삭제는 204(본문 없음)를 정상으로 받는다", async () => {
    writeStorage(STORAGE_KEYS.auth, { token: "t" });
    fetch.mockReturnValueOnce(Promise.resolve({ ok: true, status: 204 }));

    await expect(repository.deleteJob("cuid_1")).resolves.toBeUndefined();
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
  });
});
