import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/States";
import WaitlistForm from "../components/home/WaitlistForm";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import styles from "./Home.module.css";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/** 미션5 랜딩의 '핵심 기능' 4종. 문구와 아이콘을 그대로 옮겼다. */
const FEATURES = [
  {
    title: "3자 채용 매칭",
    desc: "구인기업 · 구직자 · 전문 파트너를 연결해, 딱 맞는 사람과 일을 빠르게 잇습니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17.5" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 19a4.2 4.2 0 0 1 5.8-3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "임직원 복지몰",
    desc: "입사부터 퇴직까지, 총보상을 한 곳에서 설계하고 지급합니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20s-6.5-3.8-6.5-8.4A3.5 3.5 0 0 1 12 9a3.5 3.5 0 0 1 6.5 2.6C18.5 16.2 12 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "데이터 통합",
    desc: "흩어진 채용·인사·복지 데이터를 모아 의사결정에 쓰이는 인사이트로 바꿉니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 16v-4M12 16V8M16 16v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "일하는 방식은 가볍게",
    desc: "반복 업무는 자동화가 맡고, 사람은 사람에게 집중합니다.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l2.2 4.5L19 8.2l-3.4 3.3.8 4.8L12 14l-4.4 2.3.8-4.8L5 8.2l4.8-.7L12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/** 이 MVP를 실제로 쓰는 순서. */
const STEPS = [
  {
    no: "01",
    icon: "🔍",
    title: "탐색한다",
    desc: "직군·고용 형태·키워드로 좁혀 맞는 자리를 찾습니다.",
  },
  {
    no: "02",
    icon: "📄",
    title: "지원한다",
    desc: "공고 상세에서 바로 지원서를 씁니다. 입력값은 즉시 검증됩니다.",
  },
  {
    no: "03",
    icon: "📌",
    title: "관리한다",
    desc: "지원 내역이 한곳에 쌓입니다. 새로고침해도 남습니다.",
  },
];

export default function Home() {
  useDocumentTitle();
  const { jobs, applications, status } = useJobs();
  const { isAuthenticated } = useAuth();

  const companyCount = new Set(jobs.map((job) => job.company)).size;
  const loading = status === "loading";

  const stat = (value) =>
    loading ? (
      <Skeleton width={44} height={26} style={{ margin: "0 auto" }} />
    ) : (
      <span className={styles.statValue}>{value}</span>
    );

  return (
    <>
      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>🚀 프론트엔드 MVP · 통합 HR 플랫폼</p>
          <h1 className={styles.title}>
            채용부터 복지까지,
            <br />
            <span className={styles.grad}>사람과 일을 잇다</span>
          </h1>
          <p className={styles.lead}>
            구인기업 · 구직자 · 전문 파트너를 하나로 잇습니다. 공고를 올리고 찾고 지원하는 일까지,{" "}
            <strong>Linkple</strong> 안에서 끝납니다.
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
            학습용 MVP입니다. 입력한 데이터는 학습용 서버에 저장됩니다.
          </p>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>등록 공고</dt>
              <dd>{stat(jobs.length)}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>참여 기업</dt>
              <dd>{stat(companyCount)}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>내 지원</dt>
              <dd>{stat(applications.length)}</dd>
            </div>
          </dl>
        </Container>
      </section>

      <Container>
        {/* ===== 문제 → 해결 ===== */}
        <section className={styles.section} aria-labelledby="problem-title">
          <p className={styles.eyebrowCenter}>왜 Linkple인가</p>
          <h2 id="problem-title" className={styles.sectionTitle}>
            HR은 왜 늘 흩어져 있을까요?
          </h2>

          <div className={styles.psGrid}>
            <Card as="article" className={[styles.psCard, styles.psProblem].join(" ")}>
              <h3>흩어진 도구</h3>
              <p>
                채용 툴 따로, 복지 따로, 데이터 따로. 담당자는 창을 옮겨 다니고, 구성원 경험은
                곳곳에서 끊깁니다.
              </p>
            </Card>

            <div className={styles.psArrow} aria-hidden="true">
              →
            </div>

            <Card as="article" className={[styles.psCard, styles.psSolution].join(" ")}>
              <h3>하나의 흐름</h3>
              <p>
                <strong>채용 → 온보딩 → 복지 → 총보상</strong>까지 한 줄기로 잇습니다. 담당자는 덜
                일하고, 구성원은 더 좋은 경험을 얻습니다.
              </p>
            </Card>
          </div>
        </section>

        {/* ===== 핵심 기능 ===== */}
        <section className={styles.section} aria-labelledby="features-title">
          <p className={styles.eyebrowCenter}>핵심 기능</p>
          <h2 id="features-title" className={styles.sectionTitle}>
            입사부터 퇴직까지, 한 곳에서
          </h2>

          <div className={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <Card key={feature.title} as="article">
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== 이 MVP 사용법 ===== */}
        <section className={styles.section} aria-labelledby="how-title">
          <p className={styles.eyebrowCenter}>지금 써볼 수 있는 것</p>
          <h2 id="how-title" className={styles.sectionTitle}>
            세 걸음이면 충분합니다
          </h2>
          <p className={styles.sectionDesc}>
            네 가지 중 <strong>채용 매칭</strong>을 먼저 만들었습니다. 아래 흐름은 지금 바로
            동작합니다.
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

        {/* ===== 기대효과 / 타깃 ===== */}
        <section className={styles.impact} aria-labelledby="impact-title">
          <div>
            <p className={styles.eyebrow}>누구를 위해</p>
            <h2 id="impact-title" className={styles.impactTitle}>
              HR을 혼자 짊어진
              <br />
              담당자를 위해
            </h2>
            <p className={styles.impactLead}>
              채용도, 온보딩도, 복지도 결국 한 사람에게 몰립니다. Linkple은 그 부담을 나눕니다.
            </p>
          </div>

          <ul className={styles.statList} aria-label="기대 효과">
            <li className={styles.statItem}>
              <strong>1곳</strong>
              <span>채용·복지·데이터 통합</span>
            </li>
            <li className={styles.statItem}>
              <strong>더 적게</strong>
              <span>반복 업무·창 이동 시간</span>
            </li>
            <li className={styles.statItem}>
              <strong>더 좋게</strong>
              <span>입사~퇴직 구성원 경험</span>
            </li>
          </ul>
        </section>

        {/* ===== CTA ===== */}
        <section className={styles.cta} aria-labelledby="cta-title">
          <h2 id="cta-title" className={styles.ctaTitle}>
            가장 먼저 만나보세요
          </h2>
          <p className={styles.ctaDesc}>
            출시되면 제일 먼저 알려드릴게요. 지금 바로 둘러보셔도 좋습니다.
          </p>

          <WaitlistForm />

          <p className={styles.fineprintCta}>
            학습용 서버에 사전 신청으로 저장되며, 메일을 보내지는 않습니다.
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
