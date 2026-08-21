import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/States";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import styles from "./Home.module.css";

const STEPS = [
  {
    no: "01",
    icon: "🔍",
    title: "탐색한다",
    desc: "직군·고용 형태·키워드로 좁혀 지금 나에게 맞는 자리를 찾습니다.",
  },
  {
    no: "02",
    icon: "📄",
    title: "지원한다",
    desc: "공고 상세에서 바로 지원서를 씁니다. 입력값은 그 자리에서 검증됩니다.",
  },
  {
    no: "03",
    icon: "📌",
    title: "관리한다",
    desc: "지원 내역이 한곳에 쌓입니다. 새로고침해도 사라지지 않습니다.",
  },
];

export default function Home() {
  const { jobs, applications, status } = useJobs();
  const { isAuthenticated } = useAuth();

  const companyCount = new Set(jobs.map((job) => job.company)).size;
  const loading = status === "loading";

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>🚀 프론트엔드 MVP · 통합 HR 플랫폼</p>
          <h1 className={styles.title}>
            채용부터 복지까지,
            <br />
            <span className={styles.grad}>사람과 일을 잇다</span>
          </h1>
          <p className={styles.lead}>
            구인기업 · 구직자 · 전문 파트너를 하나의 흐름으로 연결합니다. 공고를 올리고, 찾고,
            지원하는 일까지 <strong>Linkple</strong> 안에서 끝납니다.
          </p>

          <div className={styles.actions}>
            <Button size="lg" to="/jobs">
              공고 둘러보기
            </Button>
            <Button size="lg" variant="ghost" to={isAuthenticated ? "/jobs/new" : "/login"}>
              공고 등록하기
            </Button>
          </div>

          <p className={styles.note}>
            백엔드 없이 브라우저 저장소로 동작하는 학습용 MVP입니다. 데이터는 이 브라우저에만
            남습니다.
          </p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>등록 공고</dt>
              <dd>
                {loading ? (
                  <Skeleton width={44} height={26} style={{ margin: "0 auto" }} />
                ) : (
                  <span className={styles.statValue}>{jobs.length}</span>
                )}
              </dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>참여 기업</dt>
              <dd>
                {loading ? (
                  <Skeleton width={44} height={26} style={{ margin: "0 auto" }} />
                ) : (
                  <span className={styles.statValue}>{companyCount}</span>
                )}
              </dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>내 지원</dt>
              <dd>
                {loading ? (
                  <Skeleton width={44} height={26} style={{ margin: "0 auto" }} />
                ) : (
                  <span className={styles.statValue}>{applications.length}</span>
                )}
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      <Container>
        <section className={styles.section} aria-labelledby="how-title">
          <h2 id="how-title" className={styles.sectionTitle}>
            세 걸음이면 충분합니다
          </h2>
          <p className={styles.sectionDesc}>
            흩어진 채용 업무를 하나의 화면 흐름으로 잇습니다.
          </p>

          <div className={styles.steps}>
            {STEPS.map((step) => (
              <Card key={step.no} className={styles.step}>
                <span className={styles.stepNo} aria-hidden="true">
                  {step.no}
                </span>
                <span className={styles.stepIcon} aria-hidden="true">
                  {step.icon}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-title">
          <h2 id="cta-title" className={styles.ctaTitle}>
            지금 바로 써보세요
          </h2>
          <p className={styles.ctaDesc}>
            가입 절차 없이, 아무 이메일로 로그인해 전체 흐름을 확인할 수 있습니다.
          </p>
          <div className={styles.ctaActions}>
            <Button size="lg" variant="ghost" to="/jobs">
              공고 탐색 시작
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}
