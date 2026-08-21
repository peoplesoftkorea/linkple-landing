import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <Container narrow className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>길을 잘못 드셨습니다</h1>
      <p className={styles.desc}>요청하신 주소에 해당하는 화면이 없습니다.</p>
      <div className={styles.actions}>
        <Button to="/">홈으로</Button>
        <Button variant="ghost" to="/jobs">
          공고 탐색
        </Button>
      </div>
    </Container>
  );
}
