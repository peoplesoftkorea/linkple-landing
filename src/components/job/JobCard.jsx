import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { formatRelative, formatSalary } from "../../lib/format";
import styles from "./JobCard.module.css";

export default function JobCard({ job, applied = false }) {
  return (
    <Card as="article" interactive className={styles.card}>
      <Link to={`/jobs/${job.id}`} aria-label={`${job.company} ${job.title} 상세 보기`}>
        <div className={styles.top}>
          <div className={styles.tags}>
            <Badge tone="brand">{job.category}</Badge>
            <Badge tone="outline">{job.employmentType}</Badge>
            {job.source === "user" && <Badge tone="info">내가 등록</Badge>}
            {applied && <Badge tone="warning">지원함</Badge>}
          </div>
          <span className={styles.date}>{formatRelative(job.createdAt)}</span>
        </div>

        <h3 className={styles.title}>{job.title}</h3>

        <p className={styles.meta}>
          <span className={styles.company}>{job.company}</span>
          <span className={styles.sep} aria-hidden="true">
            |
          </span>
          <span>{job.location}</span>
        </p>

        <p className={styles.desc}>{job.description}</p>

        <div className={styles.bottom}>
          <span className={styles.salary}>{formatSalary(job.salary)}</span>
          <span className={styles.more} aria-hidden="true">
            자세히 보기 →
          </span>
        </div>
      </Link>
    </Card>
  );
}
