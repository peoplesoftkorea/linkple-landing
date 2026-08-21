import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import styles from "./Layout.module.css";

/** 모든 페이지가 공유하는 껍데기. 라우팅이 바뀌어도 헤더·푸터는 유지된다. */
export default function Layout() {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
