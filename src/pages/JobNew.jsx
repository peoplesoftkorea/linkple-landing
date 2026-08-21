import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { Input, Select, Textarea } from "../components/ui/Input";
import { CATEGORIES, EMPLOYMENT_TYPES } from "../data/constants";
import { hasErrors, validateJobForm } from "../lib/validate";
import { useJobs } from "../hooks/useJobs";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import styles from "./JobNew.module.css";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const EMPTY = {
  title: "",
  company: "",
  location: "",
  category: "",
  employmentType: "",
  salary: "",
  description: "",
  requirements: "",
  benefits: "",
};

export default function JobNew() {
  useDocumentTitle("공고 등록");
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const { user } = useAuth();
  const { push } = useToast();
  const summaryRef = useRef(null);

  const [values, setValues] = useState({ ...EMPTY, company: user?.company ?? "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key) => (event) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (touched[key] || errors[key]) setErrors(validateJobForm(next));
  };

  const handleBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validateJobForm(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateJobForm(values);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));

    if (hasErrors(nextErrors)) {
      // 어디가 잘못됐는지 한 번에 보이도록 요약으로 시선을 옮긴다.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const job = await addJob(values, user);
      push("공고를 등록했습니다.", "success");
      navigate(`/jobs/${job.id}`, { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  const errorList = Object.entries(errors);

  return (
    <>
      <PageHeader
        eyebrow="New posting"
        title="공고 등록"
        description="등록한 공고는 이 브라우저에 저장되어, 새로고침해도 목록에 그대로 남습니다."
      />

      <Container narrow className={styles.wrap}>
        <Card>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div className={styles.summary} ref={summaryRef} tabIndex={-1} role="alert">
                <span aria-hidden="true">⚠</span>
                <div>
                  <strong>저장하지 못했습니다.</strong>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {errorList.length > 0 && !submitError && (
              <div className={styles.summary} ref={summaryRef} tabIndex={-1} role="alert">
                <span aria-hidden="true">⚠</span>
                <div>
                  <strong>{errorList.length}곳을 확인해 주세요.</strong>
                  <ul>
                    {errorList.map(([key, message]) => (
                      <li key={key}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <Field id="job-title" label="공고 제목" required error={errors.title}>
              {({ id, errorId, invalid }) => (
                <Input
                  id={id}
                  value={values.title}
                  onChange={setField("title")}
                  onBlur={handleBlur("title")}
                  placeholder="예: HR 매니저 (채용·온보딩 총괄)"
                  invalid={invalid}
                  aria-describedby={errorId}
                />
              )}
            </Field>

            <div className={styles.grid2}>
              <Field id="job-company" label="회사명" required error={errors.company}>
                {({ id, errorId, invalid }) => (
                  <Input
                    id={id}
                    value={values.company}
                    onChange={setField("company")}
                    onBlur={handleBlur("company")}
                    placeholder="예: 링플"
                    invalid={invalid}
                    aria-describedby={errorId}
                  />
                )}
              </Field>

              <Field id="job-location" label="근무지" required error={errors.location}>
                {({ id, errorId, invalid }) => (
                  <Input
                    id={id}
                    value={values.location}
                    onChange={setField("location")}
                    onBlur={handleBlur("location")}
                    placeholder="예: 서울 마포구"
                    invalid={invalid}
                    aria-describedby={errorId}
                  />
                )}
              </Field>
            </div>

            <div className={styles.grid2}>
              <Field id="job-category" label="직군" required error={errors.category}>
                {({ id, errorId, invalid }) => (
                  <Select
                    id={id}
                    value={values.category}
                    onChange={setField("category")}
                    onBlur={handleBlur("category")}
                    invalid={invalid}
                    aria-describedby={errorId}
                  >
                    <option value="">선택해 주세요</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field
                id="job-employment"
                label="고용 형태"
                required
                error={errors.employmentType}
              >
                {({ id, errorId, invalid }) => (
                  <Select
                    id={id}
                    value={values.employmentType}
                    onChange={setField("employmentType")}
                    onBlur={handleBlur("employmentType")}
                    invalid={invalid}
                    aria-describedby={errorId}
                  >
                    <option value="">선택해 주세요</option>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>

            <Field
              id="job-salary"
              label="연봉 (만원)"
              optional
              hint="비워 두면 '회사 내규에 따름'으로 표시됩니다."
              error={errors.salary}
            >
              {({ id, hintId, errorId, invalid }) => (
                <Input
                  id={id}
                  type="number"
                  min="0"
                  step="100"
                  value={values.salary}
                  onChange={setField("salary")}
                  onBlur={handleBlur("salary")}
                  placeholder="예: 4500"
                  invalid={invalid}
                  aria-describedby={errorId ?? hintId}
                />
              )}
            </Field>

            <Field
              id="job-description"
              label="담당 업무"
              required
              error={errors.description}
              counter={`${values.description.trim().length}자`}
            >
              {({ id, errorId, invalid }) => (
                <Textarea
                  id={id}
                  value={values.description}
                  onChange={setField("description")}
                  onBlur={handleBlur("description")}
                  placeholder="이 자리에서 어떤 일을 하게 되는지 20자 이상으로 적어 주세요."
                  invalid={invalid}
                  aria-describedby={errorId}
                />
              )}
            </Field>

            <Field
              id="job-requirements"
              label="자격 요건"
              optional
              hint="한 줄에 하나씩 적어 주세요."
            >
              {({ id, hintId }) => (
                <Textarea
                  id={id}
                  value={values.requirements}
                  onChange={setField("requirements")}
                  placeholder={"HR 실무 3년 이상\n채용 프로세스 설계 경험"}
                  aria-describedby={hintId}
                />
              )}
            </Field>

            <Field
              id="job-benefits"
              label="복지 · 혜택"
              optional
              hint="한 줄에 하나씩 적어 주세요."
            >
              {({ id, hintId }) => (
                <Textarea
                  id={id}
                  value={values.benefits}
                  onChange={setField("benefits")}
                  placeholder={"복지 포인트 연 120만원\n유연 출퇴근"}
                  aria-describedby={hintId}
                />
              )}
            </Field>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                취소
              </Button>
              <Button type="submit" loading={submitting}>
                {submitting ? "등록 중" : "공고 등록"}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </>
  );
}
