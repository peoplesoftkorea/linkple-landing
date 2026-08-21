import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { STORAGE_KEYS, readStorage, writeStorage } from "../../lib/storage";
import { maskEmail } from "../../lib/format";
import styles from "./WaitlistForm.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * 미션5 랜딩의 '출시 알림 신청' 폼을 실제로 동작하게 옮긴 것.
 * 그때는 화면만 있었고 아무것도 남지 않았지만, 이제는 검증하고 저장하고
 * 다시 방문해도 신청 사실이 남는다.
 */
export default function WaitlistForm() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    setEntry(readStorage(STORAGE_KEYS.waitlist, null));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = email.trim();

    if (!value) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError("이메일 형식이 올바르지 않습니다. (예: name@company.com)");
      return;
    }

    const next = { email: value, createdAt: new Date().toISOString() };
    writeStorage(STORAGE_KEYS.waitlist, next);
    setEntry(next);
    setError("");
    setEmail("");
    push("출시 알림을 신청했습니다.", "success");
  };

  const handleReset = () => {
    writeStorage(STORAGE_KEYS.waitlist, null);
    setEntry(null);
    push("알림 신청을 취소했습니다.", "info");
  };

  if (entry) {
    return (
      <div className={styles.done}>
        <span className={styles.doneMark} aria-hidden="true">
          ✓
        </span>
        <p className={styles.doneTitle}>신청이 접수되었습니다</p>
        <p className={styles.doneDesc}>
          {maskEmail(entry.email)} 으로 출시 소식을 보내드리겠습니다.
        </p>
        <button type="button" className={styles.reset} onClick={handleReset}>
          신청 취소
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <label className="sr-only" htmlFor="waitlist-email">
          이메일 주소
        </label>
        <input
          id="waitlist-email"
          type="email"
          className={[styles.input, error ? styles.invalid : ""].filter(Boolean).join(" ")}
          placeholder="name@company.com"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "waitlist-error" : undefined}
        />
        <Button type="submit" variant="ghost" size="lg">
          출시 알림 받기
        </Button>
      </div>

      {error && (
        <p className={styles.error} id="waitlist-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </form>
  );
}
