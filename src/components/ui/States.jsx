import styles from "./States.module.css";

export function Skeleton({ width = "100%", height = 14, radius, style, ...rest }) {
  return (
    <span
      className={styles.skeleton}
      style={{ display: "block", width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

/** 목록 로딩 중 채워 넣는 자리표시. 카드와 같은 골격이라 화면이 튀지 않는다. */
export function JobCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton width="38%" height={18} />
      <Skeleton width="72%" height={22} />
      <Skeleton width="52%" height={14} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Skeleton width={68} height={24} radius="999px" />
        <Skeleton width={82} height={24} radius="999px" />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "🔍", title, description, children }) {
  return (
    <div className={styles.state}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

export function ErrorState({ title = "문제가 발생했습니다", description, children }) {
  return (
    <div className={[styles.state, styles.errorState].join(" ")} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
