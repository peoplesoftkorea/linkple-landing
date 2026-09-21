/**
 * 폼 검증 규칙.
 * 화면(JSX)과 규칙을 분리해, 같은 규칙을 여러 폼에서 같은 문구로 쓴다.
 * 반환값은 { 필드명: 에러메시지 } — 비어 있으면 통과.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

export function validateJobForm(values) {
  const errors = {};

  if (!values.title?.trim()) {
    errors.title = "공고 제목을 입력해 주세요.";
  } else if (values.title.trim().length < 5) {
    errors.title = "제목은 5자 이상으로 적어 주세요.";
  } else if (values.title.trim().length > 60) {
    errors.title = "제목은 60자를 넘길 수 없습니다.";
  }

  if (!values.company?.trim()) errors.company = "회사명을 입력해 주세요.";
  if (!values.location?.trim()) errors.location = "근무지를 입력해 주세요.";
  if (!values.category) errors.category = "직군을 선택해 주세요.";
  if (!values.employmentType) errors.employmentType = "고용 형태를 선택해 주세요.";

  if (values.salary !== "" && values.salary !== undefined) {
    const n = Number(values.salary);
    if (Number.isNaN(n) || n < 0) {
      errors.salary = "연봉은 0 이상의 숫자(만원)로 입력해 주세요.";
    } else if (n > 100_000) {
      errors.salary = "연봉 입력값이 너무 큽니다. 만원 단위인지 확인해 주세요.";
    }
  }

  if (!values.description?.trim()) {
    errors.description = "담당 업무를 입력해 주세요.";
  } else if (values.description.trim().length < 20) {
    errors.description = "담당 업무는 20자 이상으로 적어 주세요. (현재 " +
      values.description.trim().length + "자)";
  }

  return errors;
}

export function validateApplyForm(values) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = "이름을 입력해 주세요.";
  } else if (values.name.trim().length < 2) {
    errors.name = "이름은 2자 이상이어야 합니다.";
  }

  if (!values.email?.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "이메일 형식이 올바르지 않습니다. (예: name@company.com)";
  }

  if (values.phone?.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = "연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)";
  }

  if (values.message?.trim() && values.message.trim().length > 500) {
    errors.message = "지원 메시지는 500자를 넘길 수 없습니다.";
  }

  return errors;
}

export function validateLoginForm(values) {
  const errors = {};

  if (!values.email?.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }

  if (!values.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (values.password.length < 6) {
    errors.password = "비밀번호는 6자 이상이어야 합니다.";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
