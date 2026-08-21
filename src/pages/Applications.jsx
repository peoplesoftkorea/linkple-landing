import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { EmptyState } from "../components/ui/States";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/format";
import styles from "./Applications.module.css";

export default function Applications() {
  const { applications, withdrawApplication } = useJobs();
  const { user } = useAuth();
  const { push } = useToast();
  const [target, setTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const mine = useMemo(
    () =>
      applications
        .filter((app) => app.applicantEmail === user.email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [applications, user.email],
  );

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawApplication(target.id);
      setTarget(null);
      push("지원을 철회했습니다.", "info");
    } catch (error) {
      push(error.message, "error");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="My applications"
        title="내 지원 내역"
        description={`${user.email} 계정으로 접수한 지원서입니다. 브라우저에 저장되어 새로고침해도 남습니다.`}
      />

      <Container narrow className={styles.wrap}>
        {mine.length === 0 ? (
          <EmptyState
            icon="📮"
            title="아직 지원한 공고가 없습니다"
            description="관심 있는 자리를 찾아 첫 지원서를 보내 보세요."
          >
            <Button to="/jobs">공고 둘러보기</Button>
          </EmptyState>
        ) : (
          <div className={styles.list}>
            {mine.map((app) => (
              <Card key={app.id} className={styles.item}>
                <div className={styles.top}>
                  <div>
                    <h2 className={styles.title}>
                      <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                    </h2>
                    <p className={styles.company}>{app.company}</p>
                  </div>
                  <Badge tone="brand">{app.status}</Badge>
                </div>

                {app.message && <p className={styles.message}>{app.message}</p>}

                <div className={styles.foot}>
                  <span className={styles.date}>{formatDate(app.createdAt)} 접수</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="ghost" size="sm" to={`/applications/${app.id}/done`}>
                      접수증 보기
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setTarget(app)}>
                      지원 철회
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="지원을 철회할까요?"
        description={target ? `${target.company} · ${target.jobTitle}` : undefined}
      >
        <p style={{ color: "var(--ink-2)", fontSize: "0.9rem" }}>
          철회하면 접수 내역이 삭제되며 되돌릴 수 없습니다. 같은 공고에 다시 지원할 수는 있습니다.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="ghost" onClick={() => setTarget(null)}>
            그대로 두기
          </Button>
          <Button variant="danger" onClick={handleWithdraw} loading={withdrawing}>
            철회합니다
          </Button>
        </div>
      </Modal>
    </>
  );
}
