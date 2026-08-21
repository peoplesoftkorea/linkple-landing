import { useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/States";
import { useJobs } from "../hooks/useJobs";
import { formatDate, maskEmail } from "../lib/format";
import styles from "./ApplyDone.module.css";

/** 흐름의 마지막 화면. 무엇이 접수됐는지 되짚어 주고 다음 행동을 제시한다. */
export default function ApplyDone() {
  const { applicationId } = useParams();
  const { getApplicationById, status } = useJobs();

  if (status === "loading") {
    return (
      <Container narrow className={styles.wrap}>
        <Card>
          <p style={{ textAlign: "center", color: "var(--ink-3)" }}>불러오는 중…</p>
        </Card>
      </Container>
    );
  }

  const application = getApplicationById(applicationId);

  if (!application) {
    return (
      <Container narrow className={styles.wrap}>
        <EmptyState
          icon="🧾"
          title="지원 내역을 찾을 수 없습니다"
          description="이미 철회했거나 주소가 잘못되었습니다."
        >
          <Button to="/jobs">공고 목록으로</Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container narrow className={styles.wrap}>
      <Card className={styles.card}>
        <span className={styles.check} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h1 className={styles.title}>지원이 접수되었습니다</h1>
        <p className={styles.desc}>
          {application.company}에 지원서를 보냈습니다. 결과는 등록하신 이메일로 안내됩니다.
        </p>

        <div className={styles.receipt}>
          <div className={styles.row}>
            <span className={styles.key}>지원 공고</span>
            <span className={styles.value}>{application.jobTitle}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.key}>회사</span>
            <span className={styles.value}>{application.company}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.key}>지원자</span>
            <span className={styles.value}>{application.name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.key}>이메일</span>
            <span className={styles.value}>{maskEmail(application.email)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.key}>접수일</span>
            <span className={styles.value}>{formatDate(application.createdAt)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.key}>접수 번호</span>
            <span className={styles.value}>{application.id}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to="/applications">내 지원 내역</Button>
          <Button variant="ghost" to="/jobs">
            공고 더 보기
          </Button>
        </div>
      </Card>
    </Container>
  );
}
