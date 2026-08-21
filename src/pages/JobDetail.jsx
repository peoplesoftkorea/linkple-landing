import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import ApplyModal from "../components/job/ApplyModal";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { formatDate, formatSalary } from "../lib/format";
import styles from "./JobDetail.module.css";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { status, error, retry, getJobById, addApplication, removeJob, hasAppliedTo } = useJobs();
  const { user, isAuthenticated } = useAuth();
  const { push } = useToast();

  const [applyOpen, setApplyOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status === "loading") {
    return (
      <Container className={styles.wrap}>
        <div className={styles.skeletonStack}>
          <Skeleton width={120} height={16} />
          <Skeleton width="70%" height={34} />
          <Skeleton width="40%" height={18} />
          <Skeleton height={220} radius="16px" />
        </div>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container className={styles.wrap}>
        <ErrorState title="공고를 불러오지 못했습니다" description={error}>
          <Button variant="ghost" onClick={retry}>
            다시 시도
          </Button>
        </ErrorState>
      </Container>
    );
  }

  const job = getJobById(jobId);

  if (!job) {
    return (
      <Container className={styles.wrap}>
        <EmptyState
          icon="🗂️"
          title="찾을 수 없는 공고입니다"
          description="이미 삭제되었거나 주소가 잘못되었습니다."
        >
          <Button to="/jobs">공고 목록으로</Button>
        </EmptyState>
      </Container>
    );
  }

  const applied = hasAppliedTo(job.id, user?.email);
  const isOwner = job.source === "user" && (!job.createdBy || job.createdBy === user?.email);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // 로그인 후 이 공고로 되돌아오게 한다.
      push("지원하려면 먼저 로그인해 주세요.", "info");
      navigate("/login", { state: { from: `/jobs/${job.id}` } });
      return;
    }
    setApplyOpen(true);
  };

  const handleApplySubmit = (values) => {
    const application = addApplication(job, values, user);
    setApplyOpen(false);
    push("지원서를 제출했습니다.", "success");
    navigate(`/applications/${application.id}/done`, { replace: true });
  };

  const handleDelete = () => {
    removeJob(job.id);
    setConfirmOpen(false);
    push("공고를 삭제했습니다.", "info");
    navigate("/jobs", { replace: true });
  };

  return (
    <Container className={styles.wrap}>
      <Link to="/jobs" className={styles.back}>
        ← 공고 목록
      </Link>

      <header className={styles.head}>
        <div className={styles.tags}>
          <Badge tone="brand">{job.category}</Badge>
          <Badge tone="outline">{job.employmentType}</Badge>
          {job.source === "user" && <Badge tone="info">내가 등록한 공고</Badge>}
          {applied && <Badge tone="warning">지원 완료</Badge>}
        </div>
        <h1 className={styles.title}>{job.title}</h1>
        <p className={styles.company}>
          <strong>{job.company}</strong> · {job.location}
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.blocks}>
          <Card as="section">
            <h2 className={styles.blockTitle}>담당 업무</h2>
            <p className={styles.body}>{job.description}</p>
          </Card>

          {job.requirements?.length > 0 && (
            <Card as="section">
              <h2 className={styles.blockTitle}>자격 요건</h2>
              <ul className={styles.list}>
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          )}

          {job.benefits?.length > 0 && (
            <Card as="section">
              <h2 className={styles.blockTitle}>복지 · 혜택</h2>
              <ul className={styles.list}>
                {job.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          )}

          {isOwner && (
            <div className={styles.dangerZone}>
              <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                공고 삭제
              </Button>
            </div>
          )}
        </div>

        <aside className={styles.aside}>
          <Card>
            <div className={styles.summary}>
              <div>
                <p className={styles.rowKey}>연봉</p>
                <p className={styles.salary}>{formatSalary(job.salary)}</p>
              </div>
              <div className={styles.divider} />
              <div className={styles.row}>
                <span className={styles.rowKey}>고용 형태</span>
                <span className={styles.rowValue}>{job.employmentType}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>근무지</span>
                <span className={styles.rowValue}>{job.location}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>직군</span>
                <span className={styles.rowValue}>{job.category}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>등록일</span>
                <span className={styles.rowValue}>{formatDate(job.createdAt)}</span>
              </div>
              <div className={styles.divider} />

              {applied ? (
                <>
                  <p className={styles.appliedNote}>이미 지원한 공고입니다</p>
                  <Button variant="ghost" block to="/applications">
                    내 지원 내역 보기
                  </Button>
                </>
              ) : (
                <Button block size="lg" onClick={handleApplyClick}>
                  지원하기
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {applyOpen && (
        <ApplyModal
          open={applyOpen}
          job={job}
          defaults={{ name: user?.name?.replace(" 님", "") ?? "", email: user?.email ?? "" }}
          onClose={() => setApplyOpen(false)}
          onSubmit={handleApplySubmit}
        />
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="이 공고를 삭제할까요?"
        description="삭제하면 되돌릴 수 없고, 이 공고에 접수된 지원 내역도 함께 정리됩니다."
      >
        <div className={styles.confirmActions}>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제합니다
          </Button>
        </div>
      </Modal>
    </Container>
  );
}
