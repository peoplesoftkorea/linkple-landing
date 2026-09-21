import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Container from "./Container";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import styles from "./Header.module.css";

const NAV = [
  { to: "/jobs", label: "공고 탐색" },
  { to: "/jobs/new", label: "공고 등록" },
  { to: "/applications", label: "내 지원 내역" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { push } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // 페이지를 옮기면 모바일 메뉴는 스스로 닫힌다.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    push("로그아웃했습니다.", "info");
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Linkple 홈으로">
          <span className={styles.mark} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 12a4 4 0 0 1 4-4h3a4 4 0 0 1 0 8h-1"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M16 12a4 4 0 0 1-4 4H9a4 4 0 0 1 0-8h1"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Linkple</span>
          <span className={styles.ko}>링플</span>
        </Link>

        <button
          type="button"
          className={styles.toggle}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-nav"
          className={open ? styles.menuOpen : styles.menu}
          aria-label="주요 메뉴"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/jobs"}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className={styles.authArea}>
            {isAuthenticated ? (
              <>
                <span className={styles.who}>
                  <span className={styles.whoName}>{user.name}</span>
                  <span className={styles.whoMail}>{user.email}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                to="/login"
                state={{ from: location.pathname + location.search }}
              >
                로그인
              </Button>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
