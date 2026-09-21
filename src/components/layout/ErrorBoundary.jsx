import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

/**
 * 마지막 안전망.
 * 렌더 중 예외가 나면 React는 화면 전체를 지운다 — 사용자에게는 흰 화면만 남는다.
 * 그 대신 무슨 일이 있었는지 알리고, 돌아갈 길을 준다.
 *
 * 에러 경계는 클래스 컴포넌트로만 만들 수 있어 이 파일만 class를 쓴다.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // 서버가 없으므로 콘솔까지가 이 MVP의 기록 한계다.
    console.error("[Linkple] 화면을 그리는 중 오류가 발생했습니다.", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    // 전체 새로고침으로 상태를 처음부터 다시 세운다.
    window.location.href = "/";
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className={styles.wrap}>
        <div className={styles.card} role="alert">
          <span className={styles.mark} aria-hidden="true">
            ⚠️
          </span>
          <h1 className={styles.title}>화면을 표시하지 못했습니다</h1>
          <p className={styles.desc}>
            예상하지 못한 오류가 발생했습니다. 새로고침하면 대부분 해결됩니다.
            저장된 공고와 지원 내역은 그대로 남아 있습니다.
          </p>
          <p className={styles.detail}>{error.message || String(error)}</p>
          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={this.handleReload}>
              새로고침
            </button>
            <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={this.handleHome}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }
}
