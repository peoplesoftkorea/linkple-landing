/**
 * 데이터 접근 계층.
 *
 * 화면은 데이터가 어디서 오는지 모른다. 여기서만 안다.
 *  - 기본값: 브라우저 localStorage (배포본이 서버 없이 그대로 동작)
 *  - VITE_API_BASE_URL이 있으면: JSON Server Mock API (`npm run server`)
 *
 * 미션7에서 실제 API로 갈아탈 때 바꿀 곳도 이 파일 하나다.
 */

import { SEED_JOBS } from "./seedJobs";
import {
  STORAGE_KEYS,
  isStorageAvailable,
  readStorage,
  writeStorage,
} from "../lib/storage";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

/** 현재 어느 저장소를 쓰고 있는지. 화면 안내 문구에도 쓰인다. */
export const dataSource = API_BASE ? "api" : "local";

const FAKE_LATENCY_MS = 450;

const delay = (ms = FAKE_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ *
 * localStorage 구현
 * ------------------------------------------------------------------ */

const localRepository = {
  async loadAll() {
    // 네트워크 지연을 흉내 내 로딩(스켈레톤) 상태가 실제로 보이게 한다.
    await delay();

    if (!isStorageAvailable()) {
      throw new Error(
        "브라우저 저장소를 사용할 수 없습니다. 시크릿 모드이거나 저장소가 차단된 상태일 수 있습니다.",
      );
    }

    const storedJobs = readStorage(STORAGE_KEYS.jobs, null);
    if (!Array.isArray(storedJobs)) {
      // 첫 방문이거나 저장값이 깨진 경우 — 시드로 되돌린다.
      writeStorage(STORAGE_KEYS.jobs, SEED_JOBS);
      writeStorage(STORAGE_KEYS.applications, []);
      return { jobs: SEED_JOBS, applications: [] };
    }

    const storedApps = readStorage(STORAGE_KEYS.applications, null);
    return { jobs: storedJobs, applications: Array.isArray(storedApps) ? storedApps : [] };
  },

  async createJob(job) {
    await delay(200);
    const jobs = readStorage(STORAGE_KEYS.jobs, []);
    writeStorage(STORAGE_KEYS.jobs, [job, ...jobs]);
    return job;
  },

  async deleteJob(id) {
    await delay(200);
    const jobs = readStorage(STORAGE_KEYS.jobs, []);
    writeStorage(
      STORAGE_KEYS.jobs,
      jobs.filter((job) => job.id !== id),
    );

    // 사라진 공고에 매달린 지원 내역도 함께 정리한다.
    const apps = readStorage(STORAGE_KEYS.applications, []);
    writeStorage(
      STORAGE_KEYS.applications,
      apps.filter((app) => app.jobId !== id),
    );
  },

  async createApplication(application) {
    await delay(200);
    const apps = readStorage(STORAGE_KEYS.applications, []);
    writeStorage(STORAGE_KEYS.applications, [application, ...apps]);
    return application;
  },

  async deleteApplication(id) {
    await delay(200);
    const apps = readStorage(STORAGE_KEYS.applications, []);
    writeStorage(
      STORAGE_KEYS.applications,
      apps.filter((app) => app.id !== id),
    );
  },
};

/* ------------------------------------------------------------------ *
 * JSON Server (Mock API) 구현
 * ------------------------------------------------------------------ */

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      `Mock API 서버(${API_BASE})에 연결하지 못했습니다. \`npm run server\`가 켜져 있는지 확인해 주세요.`,
    );
  }

  if (!response.ok) {
    throw new Error(`요청이 실패했습니다. (HTTP ${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

const apiRepository = {
  async loadAll() {
    const [jobs, applications] = await Promise.all([
      request("/jobs"),
      request("/applications"),
    ]);
    return { jobs, applications };
  },

  createJob(job) {
    return request("/jobs", { method: "POST", body: JSON.stringify(job) });
  },

  async deleteJob(id) {
    await request(`/jobs/${id}`, { method: "DELETE" });
    const orphans = await request(`/applications?jobId=${encodeURIComponent(id)}`);
    await Promise.all(
      orphans.map((app) => request(`/applications/${app.id}`, { method: "DELETE" })),
    );
  },

  createApplication(application) {
    return request("/applications", {
      method: "POST",
      body: JSON.stringify(application),
    });
  },

  deleteApplication(id) {
    return request(`/applications/${id}`, { method: "DELETE" });
  },
};

export const repository = dataSource === "api" ? apiRepository : localRepository;
