import styles from "./Field.module.css";

/**
 * 라벨·힌트·에러를 한 벌로 묶는 폼 래퍼.
 * 에러 문구는 aria-describedby로 컨트롤과 연결해 스크린리더에도 전달한다.
 */
export default function Field({ id, label, required, optional, hint, error, children, counter }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (필수)</span>}
        </label>
        {optional && <span className={styles.optional}>선택</span>}
      </div>

      {typeof children === "function"
        ? children({ id, hintId, errorId, invalid: Boolean(error) })
        : children}

      {counter && <span className={styles.counter}>{counter}</span>}
      {hint && !error && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
