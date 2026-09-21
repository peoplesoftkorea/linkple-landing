import { Link } from "react-router-dom";
import Container from "./Container";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <div className={styles.top}>
            <div>
              <span className={styles.brand}>Linkple 링플</span>
              <p className={styles.tagline}>채용부터 복지까지, 사람과 일을 잇다.</p>
            </div>
            <nav className={styles.links} aria-label="푸터 메뉴">
              <Link to="/jobs">공고 탐색</Link>
              <Link to="/jobs/new">공고 등록</Link>
              <Link to="/applications">내 지원 내역</Link>
              <a
                href="https://linkple-landing.vercel.app"
                target="_blank"
                rel="noreferrer noopener"
              >
                소개 페이지 ↗
              </a>
            </nav>
          </div>
          <p className={styles.disclaimer}>
            코드잇 스프린트 · IT창업가 과정 <strong>스프린트 미션 6</strong> 제출용 프론트엔드
            MVP입니다. 실제 채용 중개·회원가입·결제를 제공하지 않으며, 화면의 정보는 모두 학습용
            가상 데이터입니다.
          </p>
        </div>
      </Container>
    </footer>
  );
}
