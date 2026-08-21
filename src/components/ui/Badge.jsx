import styles from "./Badge.module.css";

export default function Badge({ tone = "neutral", children, className = "", ...rest }) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </span>
  );
}
