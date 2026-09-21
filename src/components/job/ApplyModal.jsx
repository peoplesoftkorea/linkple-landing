import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { Input, Textarea } from "../ui/Input";
import { hasErrors, validateApplyForm } from "../../lib/validate";
import styles from "./ApplyModal.module.css";

const MESSAGE_MAX = 500;

/**
 * 지원서 모달.
 * 제출 전에는 폼 안에서 오류를 잡고, 제출에 성공하면 완료 화면으로 넘긴다.
 */
export default function ApplyModal({ open, job, defaults, onClose, onSubmit }) {
  const [values, setValues] = useState({
    name: defaults?.name ?? "",
    email: defaults?.email ?? "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key) => (event) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    // 이미 지적한 필드는 고치는 즉시 에러를 거둔다.
    if (touched[key] || errors[key]) setErrors(validateApplyForm(next));
  };

  const handleBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validateApplyForm(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateApplyForm(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, message: true });
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      // 저장이 끝날 때까지 버튼은 로딩 상태를 유지한다.
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title="지원서 작성"
      description={`${job.company} · ${job.title}`}
      labelledBy="apply-modal-title"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: 20 }}>
        {submitError && (
          <p className={styles.alert} role="alert">
            <span aria-hidden="true">⚠</span>
            {submitError}
          </p>
        )}

        <Field id="apply-name" label="이름" required error={errors.name}>
          {({ id, errorId, invalid }) => (
            <Input
              id={id}
              value={values.name}
              onChange={setField("name")}
              onBlur={handleBlur("name")}
              placeholder="홍길동"
              autoComplete="name"
              invalid={invalid}
              aria-describedby={errorId}
            />
          )}
        </Field>

        <Field id="apply-email" label="이메일" required error={errors.email}>
          {({ id, errorId, invalid }) => (
            <Input
              id={id}
              type="email"
              value={values.email}
              onChange={setField("email")}
              onBlur={handleBlur("email")}
              placeholder="name@company.com"
              autoComplete="email"
              invalid={invalid}
              aria-describedby={errorId}
            />
          )}
        </Field>

        <Field
          id="apply-phone"
          label="연락처"
          optional
          hint="예: 010-1234-5678"
          error={errors.phone}
        >
          {({ id, hintId, errorId, invalid }) => (
            <Input
              id={id}
              type="tel"
              value={values.phone}
              onChange={setField("phone")}
              onBlur={handleBlur("phone")}
              placeholder="010-1234-5678"
              autoComplete="tel"
              invalid={invalid}
              aria-describedby={errorId ?? hintId}
            />
          )}
        </Field>

        <Field
          id="apply-message"
          label="지원 메시지"
          optional
          error={errors.message}
          counter={`${values.message.length} / ${MESSAGE_MAX}`}
        >
          {({ id, errorId, invalid }) => (
            <Textarea
              id={id}
              value={values.message}
              onChange={setField("message")}
              onBlur={handleBlur("message")}
              placeholder="이 자리에 지원하는 이유를 짧게 적어 주세요."
              maxLength={MESSAGE_MAX + 50}
              invalid={invalid}
              aria-describedby={errorId}
            />
          )}
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? "제출 중" : "지원서 제출"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
