import { useContext } from "react";
import { JobsContext } from "../contexts/JobsContext";

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs는 JobsProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
