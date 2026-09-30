import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { Input, Select, Textarea } from "../components/ui/Input";
import { CATEGORIES, EMPLOYMENT_TYPES } from "../data/constants";
import { aiApi } from "../data/repository";
import { EVENTS, track } from "../lib/analytics";
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

const AI_EMPTY = { role: "", location: "", conditions: "", highlights: "" };

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
  // ★AI 초안을 «썼는지»를 등록 시점까지 들고 간다 — 미션 8 기능이 실제로 값을 냈는지 보는 축이다.
  const usedAiRef = useRef(false);

  // 공고 작성 화면에 들어온 시점(구인자 퍼널의 1단계).
  // ⛔재마운트로 두 번 찍히지 않게 막는다 — 분모가 부풀면 게시율이 실제보다 낮게 보인다
  //   [실측 2026-09-30: 이중 마운트로 2건].
  const openLogged = useRef(false);
  useEffect(() => {
    if (openLogged.current) return;
    openLogged.current = true;
    track(EVENTS.JOB_NEW_OPENED, {});
  }, []);

  // AI 초안 패널 (미션 8) — 실패해도 아래 수동 작성 경로는 그대로 살아 있다.
  const [aiOpen, setAiOpen] = useState(false);
  const [aiValues, setAiValues] = useState(AI_EMPTY);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const setAiField = (key) => (event) => {
    setAiValues((prev) => ({ ...prev, [key]: event.target.value }));
    if (aiError) setAiError("");
  };

  const handleAiDraft = async () => {
    const role = aiValues.role.trim();
    if (role.length < 2) {
      setAiError("어떤 일을 맡을 사람인지(직무)를 2자 이상 적어 주세요.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    // ⛔입력 «내용»은 싣지 않는다 — 길이만 남겨도 「얼마나 적어야 초안이 잘 나오나」는 볼 수 있다.
    track(EVENTS.AI_DRAFT_REQUESTED, {
      role_len: role.length,
      has_location: !!aiValues.location.trim(),
      has_conditions: !!aiValues.conditions.trim(),
      has_highlights: !!aiValues.highlights.trim(),
    });
    try {
      const draft = await aiApi.draftJob({
        role,
        location: aiValues.location.trim(),
        conditions: aiValues.conditions.trim(),
        highlights: aiValues.highlights.trim(),
      });

      // 초안은 '채움'이지 '확정'이 아니다 — 사용자가 고쳐서 등록한다.
      const next = {
        ...values,
        title: draft.title,
        description: draft.description,
        requirements: (draft.requirements ?? []).join("\n"),
        benefits: (draft.benefits ?? []).join("\n"),
        category: draft.category || values.category,
        employmentType: draft.employmentType || values.employmentType,
        location: values.location || aiValues.location.trim(),
      };
      setValues(next);
      setErrors(validateJobForm(next));
      usedAiRef.current = true;
      // ★「채택」 = 초안이 폼에 «실제로 들어간» 순간이다. 요청 성공(응답 도착)과 구별한다.
      track(EVENTS.AI_DRAFT_ACCEPTED, {
        title_len: (draft.title ?? "").length,
        description_len: (draft.description ?? "").length,
        requirements_count: (draft.requirements ?? []).length,
      });
      push("AI 초안을 채웠습니다. 내용을 확인하고 고쳐서 등록해 주세요.", "success");
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

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
      // ★구인자 Aha — 서버 저장 성공 뒤. `used_ai` 로 AI 초안의 기여를 나눈다.
      track(EVENTS.JOB_POSTED, {
        job_id: job.id,
        used_ai: usedAiRef.current,
        category: values.category,
        employment_type: values.employmentType,
      });
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
        description="등록한 공고는 서버에 저장되어 모든 방문자에게 바로 보입니다."
      />

      <Container narrow className={styles.wrap}>
        <Card className={styles.aiCard}>
          <div className={styles.aiHead}>
            <div>
              <h2 className={styles.aiTitle}>
                <span aria-hidden="true">✨</span> AI로 초안 만들기
              </h2>
              <p className={styles.aiDesc}>
                직무만 적어도 됩니다. 초안이 아래 폼에 채워지면 고쳐서 등록하세요.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAiOpen((v) => !v)}
              aria-expanded={aiOpen}
              aria-controls="ai-draft-panel"
            >
              {aiOpen ? "접기" : "펼치기"}
            </Button>
          </div>

          {aiOpen && (
            <div id="ai-draft-panel" className={styles.aiPanel}>
              <div className={styles.grid2}>
                <Field id="ai-role" label="직무" required>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={aiValues.role}
                      onChange={setAiField("role")}
                      placeholder="예: 주말 홀서빙"
                      maxLength={60}
                    />
                  )}
                </Field>
                <Field id="ai-location" label="근무지" optional>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={aiValues.location}
                      onChange={setAiField("location")}
                      placeholder="예: 서울 마포구"
                      maxLength={60}
                    />
                  )}
                </Field>
              </div>
              <div className={styles.grid2}>
                <Field id="ai-conditions" label="근무 조건" optional>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={aiValues.conditions}
                      onChange={setAiField("conditions")}
                      placeholder="예: 시급 13,000원 · 토·일 11~20시"
                      maxLength={200}
                    />
                  )}
                </Field>
                <Field id="ai-highlights" label="강조하고 싶은 점" optional>
                  {({ id }) => (
                    <Input
                      id={id}
                      value={aiValues.highlights}
                      onChange={setAiField("highlights")}
                      placeholder="예: 식사 제공 · 초보 환영"
                      maxLength={200}
                    />
                  )}
                </Field>
              </div>

              {aiError && (
                <p className={styles.aiError} role="alert">
                  <span aria-hidden="true">⚠</span> {aiError}
                </p>
              )}

              <div className={styles.aiActions}>
                {aiLoading && (
                  <span className={styles.aiStatus} role="status">
                    초안을 만드는 중입니다… 보통 5초 안에 끝납니다.
                  </span>
                )}
                <Button type="button" onClick={handleAiDraft} loading={aiLoading}>
                  {aiLoading ? "만드는 중" : "초안 만들기"}
                </Button>
              </div>
            </div>
          )}
        </Card>

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
