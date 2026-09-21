import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import { EmptyState, ErrorState, JobCardSkeleton } from "../components/ui/States";
import JobCard from "../components/job/JobCard";
import JobFilters from "../components/job/JobFilters";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import styles from "./Jobs.module.css";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const DEFAULTS = { keyword: "", category: "전체", employmentType: "전체", sort: "latest" };

export default function Jobs() {
  useDocumentTitle("공고 탐색");
  // 필터를 URL에 실어 두면, 상세를 보고 뒤로 왔을 때 조건이 그대로 남는다.
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, applications, status, error, retry } = useJobs();
  const { user } = useAuth();

  const filters = {
    keyword: searchParams.get("q") ?? DEFAULTS.keyword,
    category: searchParams.get("category") ?? DEFAULTS.category,
    employmentType: searchParams.get("type") ?? DEFAULTS.employmentType,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
  };

  const handleChange = (next) => {
    const params = {};
    if (next.keyword) params.q = next.keyword;
    if (next.category !== DEFAULTS.category) params.category = next.category;
    if (next.employmentType !== DEFAULTS.employmentType) params.type = next.employmentType;
    if (next.sort !== DEFAULTS.sort) params.sort = next.sort;
    setSearchParams(params, { replace: true });
  };

  const visibleJobs = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      if (filters.category !== "전체" && job.category !== filters.category) return false;
      if (filters.employmentType !== "전체" && job.employmentType !== filters.employmentType) {
        return false;
      }
      if (!keyword) return true;
      return [job.title, job.company, job.location, job.description]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    const sorted = [...filtered];
    if (filters.sort === "salary") {
      sorted.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else if (filters.sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [jobs, filters.category, filters.employmentType, filters.keyword, filters.sort]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        applications
          .filter((app) => !user || app.applicantEmail === user.email)
          .map((app) => app.jobId),
      ),
    [applications, user],
  );

  return (
    <>
      <PageHeader
        eyebrow="Jobs"
        title="지금 열려 있는 자리"
        description="직군과 고용 형태로 좁히고, 키워드로 찾아보세요. 조건은 주소에 남아 뒤로 가도 유지됩니다."
      >
        <Button to="/jobs/new" size="sm">
          + 공고 등록
        </Button>
      </PageHeader>

      <Container className={styles.wrap}>
        <JobFilters
          value={filters}
          onChange={handleChange}
          onReset={() => setSearchParams({}, { replace: true })}
          resultCount={visibleJobs.length}
          totalCount={jobs.length}
        />

        {status === "loading" && (
          <div className={styles.grid} aria-busy="true" aria-label="공고를 불러오는 중">
            {Array.from({ length: 6 }, (_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className={styles.empty}>
            <ErrorState title="공고를 불러오지 못했습니다" description={error}>
              <Button variant="ghost" onClick={retry}>
                다시 시도
              </Button>
            </ErrorState>
          </div>
        )}

        {status === "ready" && visibleJobs.length === 0 && (
          <div className={styles.empty}>
            {jobs.length === 0 ? (
              <EmptyState
                icon="📭"
                title="아직 등록된 공고가 없습니다"
                description="첫 공고를 올려 이 자리를 채워 주세요."
              >
                <Button to="/jobs/new">공고 등록하기</Button>
              </EmptyState>
            ) : (
              <EmptyState
                title="조건에 맞는 공고가 없습니다"
                description="검색어를 줄이거나 필터를 풀면 더 많은 공고를 볼 수 있습니다."
              >
                <Button variant="ghost" onClick={() => setSearchParams({}, { replace: true })}>
                  조건 초기화
                </Button>
              </EmptyState>
            )}
          </div>
        )}

        {status === "ready" && visibleJobs.length > 0 && (
          <div className={styles.grid}>
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} applied={appliedJobIds.has(job.id)} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
