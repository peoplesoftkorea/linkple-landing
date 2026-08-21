import { useCallback, useEffect, useMemo, useReducer } from "react";
import { JobsContext } from "./JobsContext";
import { SEED_JOBS } from "../data/seedJobs";
import { STORAGE_KEYS, readStorage, writeStorage } from "../lib/storage";
import { createId } from "../lib/id";

const FAKE_LATENCY_MS = 450;

const initialState = {
  status: "loading", // loading | ready | error
  error: null,
  jobs: [],
  applications: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "hydrate/start":
      return { ...state, status: "loading", error: null };

    case "hydrate/success":
      return {
        status: "ready",
        error: null,
        jobs: action.jobs,
        applications: action.applications,
      };

    case "hydrate/error":
      return { ...state, status: "error", error: action.error };

    case "job/add":
      return { ...state, jobs: [action.job, ...state.jobs] };

    case "job/remove":
      return {
        ...state,
        jobs: state.jobs.filter((job) => job.id !== action.id),
        // 사라진 공고에 매달린 지원 내역도 함께 정리한다.
        applications: state.applications.filter((app) => app.jobId !== action.id),
      };

    case "application/add":
      return { ...state, applications: [action.application, ...state.applications] };

    case "application/withdraw":
      return {
        ...state,
        applications: state.applications.filter((app) => app.id !== action.id),
      };

    default:
      return state;
  }
}

export default function JobsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 저장소에서 읽어 온다. 비어 있으면 Mock 데이터를 심는다.
  // 에러 화면을 실제로 검증할 수 있도록, 실패 시 다시 시도할 수 있게 분리했다.
  const load = useCallback(() => {
    dispatch({ type: "hydrate/start" });

    return new Promise((resolve) => {
      // 네트워크 지연을 흉내 내 로딩(스켈레톤) 상태가 실제로 보이게 한다.
      setTimeout(() => {
        if (!isStorageAvailable()) {
          dispatch({
            type: "hydrate/error",
            error:
              "브라우저 저장소를 사용할 수 없습니다. 시크릿 모드이거나 저장소가 차단된 상태일 수 있습니다.",
          });
          resolve(false);
          return;
        }

        const storedJobs = readStorage(STORAGE_KEYS.jobs, null);
        const storedApps = readStorage(STORAGE_KEYS.applications, null);

        if (!Array.isArray(storedJobs)) {
          // 첫 방문이거나 저장값이 깨진 경우 — 시드로 되돌린다.
          writeStorage(STORAGE_KEYS.jobs, SEED_JOBS);
          dispatch({ type: "hydrate/success", jobs: SEED_JOBS, applications: [] });
          resolve(true);
          return;
        }

        dispatch({
          type: "hydrate/success",
          jobs: storedJobs,
          applications: Array.isArray(storedApps) ? storedApps : [],
        });
        resolve(true);
      }, FAKE_LATENCY_MS);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ready 이후의 변경만 저장한다. (loading 단계에서 빈 배열로 덮어쓰지 않도록)
  useEffect(() => {
    if (state.status !== "ready") return;
    writeStorage(STORAGE_KEYS.jobs, state.jobs);
  }, [state.status, state.jobs]);

  useEffect(() => {
    if (state.status !== "ready") return;
    writeStorage(STORAGE_KEYS.applications, state.applications);
  }, [state.status, state.applications]);

  const addJob = useCallback((values, author) => {
    const job = {
      id: createId("job"),
      title: values.title.trim(),
      company: values.company.trim(),
      location: values.location.trim(),
      category: values.category,
      employmentType: values.employmentType,
      salary: Number(values.salary) || 0,
      description: values.description.trim(),
      requirements: splitLines(values.requirements),
      benefits: splitLines(values.benefits),
      createdAt: new Date().toISOString(),
      source: "user",
      createdBy: author?.email ?? null,
    };
    dispatch({ type: "job/add", job });
    return job;
  }, []);

  const removeJob = useCallback((id) => {
    dispatch({ type: "job/remove", id });
  }, []);

  const addApplication = useCallback((job, values, applicant) => {
    const application = {
      id: createId("app"),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      message: values.message?.trim() ?? "",
      applicantEmail: applicant?.email ?? values.email.trim(),
      status: "접수 완료",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "application/add", application });
    return application;
  }, []);

  const withdrawApplication = useCallback((id) => {
    dispatch({ type: "application/withdraw", id });
  }, []);

  const getJobById = useCallback(
    (id) => state.jobs.find((job) => job.id === id) ?? null,
    [state.jobs],
  );

  const getApplicationById = useCallback(
    (id) => state.applications.find((app) => app.id === id) ?? null,
    [state.applications],
  );

  const hasAppliedTo = useCallback(
    (jobId, email) =>
      state.applications.some((app) => app.jobId === jobId && app.applicantEmail === email),
    [state.applications],
  );

  const value = useMemo(
    () => ({
      ...state,
      retry: load,
      addJob,
      removeJob,
      addApplication,
      withdrawApplication,
      getJobById,
      getApplicationById,
      hasAppliedTo,
    }),
    [
      state,
      load,
      addJob,
      removeJob,
      addApplication,
      withdrawApplication,
      getJobById,
      getApplicationById,
      hasAppliedTo,
    ],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

/** 저장소를 실제로 쓸 수 있는지 확인한다. (시크릿 모드·정책 차단 대비) */
function isStorageAvailable() {
  try {
    const probe = "linkple.__probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** 줄바꿈으로 입력받은 목록형 필드를 배열로 바꾼다. */
function splitLines(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter(Boolean);
}
