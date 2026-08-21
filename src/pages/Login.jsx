import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { hasErrors, validateLoginForm } from "../lib/validate";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import styles from "./Login.module.css";

const DEMO = { email: "hr@linkple.kr", password: "linkple123" };

/**
 * 로그인 시뮬레이션 화면.
 * 서버 검증은 없지만, 폼 검증 · 로딩 · 실패 · 원래 화면 복귀까지
 * 실제 로그인이 갖춰야 할 흐름은 모두 갖춘다.
 */
export default function Login() {
  const { isAuthenticated, login, pending } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ?? "/jobs";

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  const setField = (key) => (event) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (errors[key]) setErrors(validateLoginForm(next));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    try {
      const user = await login(values);
      push(`${user.name} 반갑습니다.`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <Container narrow className={styles.wrap}>
      <Card className={styles.card}>
        <div className={styles.head}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.desc}>공고 등록과 지원에는 로그인이 필요합니다.</p>
        </div>

        <div className={styles.notice}>
          <span aria-hidden="true">💡</span>
          <div>
            <strong>학습용 시뮬레이션입니다.</strong> 실제 계정 인증은 하지 않습니다. 형식이 맞는
            이메일과 6자 이상 비밀번호면 로그인되고, 로그인 상태는 이 브라우저에만 저장됩니다.
            <br />
            <button
              type="button"
              className={styles.fill}
              onClick={() => {
                setValues(DEMO);
                setErrors({});
                setFormError("");
              }}
            >
              데모 계정 채워 넣기 ({DEMO.email})
            </button>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && (
            <p className={styles.alert} role="alert">
              <span aria-hidden="true">⚠</span>
              {formError}
            </p>
          )}

          <Field id="login-email" label="이메일" required error={errors.email}>
            {({ id, errorId, invalid }) => (
              <Input
                id={id}
                type="email"
                value={values.email}
                onChange={setField("email")}
                placeholder="name@company.com"
                autoComplete="username"
                invalid={invalid}
                aria-describedby={errorId}
              />
            )}
          </Field>

          <Field id="login-password" label="비밀번호" required error={errors.password}>
            {({ id, errorId, invalid }) => (
              <Input
                id={id}
                type="password"
                value={values.password}
                onChange={setField("password")}
                placeholder="6자 이상"
                autoComplete="current-password"
                invalid={invalid}
                aria-describedby={errorId}
              />
            )}
          </Field>

          <Button type="submit" block size="lg" loading={pending}>
            {pending ? "로그인 중" : "로그인"}
          </Button>
        </form>
      </Card>
    </Container>
  );
}
