import Container from "./Container";
import styles from "./PageHeader.module.css";

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className={styles.wrap}>
      <Container>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </Container>
    </div>
  );
}
