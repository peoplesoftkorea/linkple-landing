/**
 * 데이터 접근 계층.
 *
 * 화면은 데이터가 어디서 오는지 모른다. 여기서만 안다.
 *  - 기본값: 미션7 백엔드 API (같은 오리진의 `/api`)
 *  - VITE_API_BASE_URL 로 주소를 바꿀 수 있다 (로컬 개발: http://localhost:3001)
 *
 * 이 파일이 하는 일은 둘이다.
 *  ① 요청을 보내고 ② 서버의 모양을 화면이 쓰던 모양으로 번역한다.
 * 번역을 여기에 두는 이유 — 서버 응답이 바뀌어도 화면 20곳을 고치지 않기 위해서다.
 */

import { STORAGE_KEYS, readStorage } from "../lib/storage";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

/** 어디서 읽고 있는지. 화면 안내 문구에도 쓰인다. */
export const dataSource = "api";

/* ------------------------------------------------------------------ *
 * 요청
 * ------------------------------------------------------------------ */

/** 로그인하면 저장해 둔 토큰. 있으면 실어 보내고, 없으면 그냥 보낸다. */
function authHeader() {
  const session = readStorage(STORAGE_KEYS.auth, null);
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...authHeader(), ...options.headers },
    });
  } catch {
    // 네트워크가 끊긴 것과 서버가 400을 준 것은 사용자에게 다른 사건이다.
    throw new Error("서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.");
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // 서버가 사람이 읽을 문장을 보내면 그대로 쓴다. 없으면 상태코드로 만든다.
    throw new Error(body?.message ?? `요청이 실패했습니다. (HTTP ${response.status})`);
  }
  return body;
}

/* ------------------------------------------------------------------ *
 * 번역 — 서버의 모양 → 화면이 쓰던 모양
 * ------------------------------------------------------------------ */

const STATUS_LABEL = {
  RECEIVED: "접수 완료",
  REVIEWING: "검토 중",
  ACCEPTED: "합격",
  REJECTED: "불합격",
};

const toJob = (job) => ({
  ...job,
  salary: job.salary ?? 0,
  requirements: job.requirements ?? [],
  benefits: job.benefits ?? [],
  createdBy: job.author?.email ?? job.createdBy ?? null,
});

const toApplication = (app) => ({
  id: app.id,
  jobId: app.jobId,
  jobTitle: app.job?.title ?? "",
  company: app.job?.company ?? "",
  name: app.name,
  email: app.email,
  phone: app.phone ?? "",
  message: app.message ?? "",
  applicantEmail: app.email,
  status: STATUS_LABEL[app.status] ?? "접수 완료",
  createdAt: app.createdAt,
});

/* ------------------------------------------------------------------ *
 * 저장소
 * ------------------------------------------------------------------ */

export const repository = {
  async loadAll() {
    const { jobs } = await request("/jobs?pageSize=100");

    // 지원 내역은 로그인한 사람의 것만 존재한다. 비로그인 방문자에게는 빈 배열이
    // 정상이지 오류가 아니다 — 여기서 삼키지 않으면 목록 화면 전체가 에러로 뒤집힌다.
    let applications = [];
    if (readStorage(STORAGE_KEYS.auth, null)?.token) {
      try {
        applications = (await request("/applications")).map(toApplication);
      } catch {
        applications = [];
      }
    }
    return { jobs: jobs.map(toJob), applications };
  },

  async createJob(job) {
    // id·createdAt·source 는 보내지 않는다. 그건 이제 서버가 정한다.
    const created = await request("/jobs", {
      method: "POST",
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        location: job.location,
        category: job.category,
        employmentType: job.employmentType,
        salary: job.salary ? Number(job.salary) : null,
        description: job.description,
        requirements: job.requirements ?? [],
        benefits: job.benefits ?? [],
      }),
    });
    return toJob(created);
  },

  async deleteJob(id) {
    // 딸린 지원 내역은 서버(스키마의 Cascade)가 함께 정리한다.
    // 미션6에서는 이 정리를 클라이언트가 했다 — 중간에 창을 닫으면 고아가 남았다.
    await request(`/jobs/${id}`, { method: "DELETE" });
  },

  async createApplication(application) {
    const created = await request("/applications", {
      method: "POST",
      body: JSON.stringify({
        jobId: application.jobId,
        name: application.name,
        email: application.email,
        phone: application.phone || null,
        message: application.message || null,
      }),
    });
    return toApplication(created);
  },

  async deleteApplication(id) {
    await request(`/applications/${id}`, { method: "DELETE" });
  },
};

/** 로그인·회원가입도 같은 통로를 쓴다. */
export const authApi = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (payload) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
};
