import styles from "./ToastViewport.module.css";

const MARKS = { success: "✓", error: "!", info: "i" };

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className={styles.viewport} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={[styles.toast, styles[toast.tone]].join(" ")}>
          <span className={styles.mark} aria-hidden="true">
            {MARKS[toast.tone] ?? "•"}
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(toast.id)}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
