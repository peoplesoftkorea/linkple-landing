import { Link } from "react-router-dom";
import styles from "./Button.module.css";

/**
 * 하나의 버튼 정의로 앱 전체를 덮는다.
 * `to`가 주어지면 링크로, 아니면 버튼으로 렌더링해 시각적 일관성을 유지한다.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  to,
  className = "",
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    block ? styles.block : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
