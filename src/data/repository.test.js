import { beforeEach, describe, expect, it } from "vitest";
import { dataSource, repository } from "./repository";
import { STORAGE_KEYS, readStorage } from "../lib/storage";

/**
 * 테스트 환경에는 VITE_API_BASE_URL이 없으므로 localStorage 구현이 선택된다.
 * 배포본이 쓰는 경로와 같은 경로를 검증한다.
 */
describe("repository (localStorage 모드)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("배포 기본값은 localStorage 모드다", () => {
    expect(dataSource).toBe("local");
  });

  it("첫 방문이면 Mock 데이터를 심는다", async () => {
    const { jobs, applications } = await repository.loadAll();

    expect(jobs).toHaveLength(10);
    expect(applications).toEqual([]);
    // 다음 방문을 위해 저장까지 끝나 있어야 한다
    expect(readStorage(STORAGE_KEYS.jobs, null)).toHaveLength(10);
  });

  it("저장값이 깨져 있으면 시드로 되돌린다", async () => {
    window.localStorage.setItem(STORAGE_KEYS.jobs, "{망가진 JSON");

    const { jobs } = await repository.loadAll();

    expect(jobs).toHaveLength(10);
  });

  it("등록한 공고는 새로고침 뒤에도 남는다", async () => {
    await repository.loadAll();
    await repository.createJob({ id: "job_test", title: "테스트 공고" });

    const { jobs } = await repository.loadAll();

    expect(jobs).toHaveLength(11);
    expect(jobs[0].id).toBe("job_test");
  });

  it("공고를 지우면 거기 달린 지원 내역도 함께 정리된다", async () => {
    await repository.loadAll();
    await repository.createJob({ id: "job_test", title: "테스트 공고" });
    await repository.createApplication({ id: "app_1", jobId: "job_test" });
    await repository.createApplication({ id: "app_2", jobId: "job_seed_01" });

    await repository.deleteJob("job_test");
    const { jobs, applications } = await repository.loadAll();

    expect(jobs.some((job) => job.id === "job_test")).toBe(false);
    // 다른 공고의 지원 내역은 살아남는다
    expect(applications.map((app) => app.id)).toEqual(["app_2"]);
  });

  it("지원을 철회하면 그 건만 사라진다", async () => {
    await repository.loadAll();
    await repository.createApplication({ id: "app_1", jobId: "job_seed_01" });
    await repository.createApplication({ id: "app_2", jobId: "job_seed_02" });

    await repository.deleteApplication("app_1");
    const { applications } = await repository.loadAll();

    expect(applications.map((app) => app.id)).toEqual(["app_2"]);
  });
});
