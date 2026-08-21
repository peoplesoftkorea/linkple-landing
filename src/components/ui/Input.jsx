import styles from "./Field.module.css";

export function Input({ invalid, className = "", ...rest }) {
  return (
    <input
      className={[styles.control, invalid ? styles.invalid : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({ invalid, className = "", ...rest }) {
  return (
    <textarea
      className={[styles.control, styles.textarea, invalid ? styles.invalid : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Select({ invalid, className = "", children, ...rest }) {
  return (
    <select
      className={[styles.control, styles.select, invalid ? styles.invalid : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  );
}
