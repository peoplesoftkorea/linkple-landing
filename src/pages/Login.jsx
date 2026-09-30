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
import { EVENTS, identifyUser, track } from "../lib/analytics";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// 시드(prisma/seed.js)가 만드는 계정과 반드시 같아야 한다. 다르면 데모 버튼이 401을 만든다.
const DEMO = { email: "demo@linkple.kr", password: "linkple2026" };

/**
 * 로그인 시뮬레이션 화면.
 * 서버 검증은 없지만, 폼 검증 · 로딩 · 실패 · 원래 화면 복귀까지
 * 실제 로그인이 갖춰야 할 흐름은 모두 갖춘다.
 */
export default function Login() {
  useDocumentTitle("로그인");
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
    // ⛔검증 실패는 「시도」로 세지 않는다 — 폼이 막은 것은 사용자의 의도가 아니라 입력이다.
    if (hasErrors(nextErrors)) return;
    track(EVENTS.LOGIN_STARTED, { method: "email", from });

    try {
      const user = await login(values);
      // ★사람을 묶는다. ⛔이메일·이름은 싣지 않는다 — 식별자(id)와 역할만 올린다.
      identifyUser(user);
      track(EVENTS.LOGIN_COMPLETED, { method: "email", role: user.role ?? "seeker" });
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
            가입한 이메일과 비밀번호로 로그인합니다. 로그인 상태는 이 브라우저에 토큰으로 보관되며, 비밀번호는 저장하지 않습니다.
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
