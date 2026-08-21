import { useCallback, useEffect, useMemo, useReducer } from "react";
import { JobsContext } from "./JobsContext";
import { dataSource, repository } from "../data/repository";
import { createId } from "../lib/id";

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

/**
 * 공고·지원 데이터를 한곳에서 들고 있는 저장고.
 * 읽고 쓰는 일은 repository에 맡기고, 여기서는 화면에 보일 상태만 관리한다.
 */
export default function JobsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    dispatch({ type: "hydrate/start" });
    try {
      const { jobs, applications } = await repository.loadAll();
      dispatch({ type: "hydrate/success", jobs, applications });
      return true;
    } catch (error) {
      dispatch({ type: "hydrate/error", error: error.message });
      return false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addJob = useCallback(async (values, author) => {
    const job = await repository.createJob({
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
    });
    dispatch({ type: "job/add", job });
    return job;
  }, []);

  const removeJob = useCallback(async (id) => {
    await repository.deleteJob(id);
    dispatch({ type: "job/remove", id });
  }, []);

  const addApplication = useCallback(async (job, values, applicant) => {
    const application = await repository.createApplication({
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
    });
    dispatch({ type: "application/add", application });
    return application;
  }, []);

  const withdrawApplication = useCallback(async (id) => {
    await repository.deleteApplication(id);
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
      dataSource,
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

/** 줄바꿈으로 입력받은 목록형 필드를 배열로 바꾼다. */
function splitLines(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter(Boolean);
}
