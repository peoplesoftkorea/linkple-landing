// 입력 검증 — 프론트(src/lib/validate.js)와 같은 규칙을 서버에서 다시 건다.
//
// 프론트 검증은 사용자를 돕기 위한 것이고, 서버 검증은 데이터를 지키기 위한 것이다.
// 브라우저를 거치지 않고 API를 직접 부르는 요청은 프론트 검증을 통과한 적이 없다.
import * as s from 'superstruct';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

const Email = s.define('Email', (v) => typeof v === 'string' && EMAIL_RE.test(v.trim()));
const Phone = s.define('Phone', (v) => typeof v === 'string' && PHONE_RE.test(v.trim()));

export const CATEGORIES = ['경영지원·인사', '개발', '디자인', '마케팅', '영업', '생산·물류', '고객지원'];
export const EMPLOYMENT_TYPES = ['정규직', '계약직', '인턴', '파트타임'];

export const LoginInput = s.object({
  email: Email,
  password: s.size(s.string(), 6, 72),      // 프론트와 같은 6자 하한
});

export const SignupInput = s.object({
  email: Email,
  password: s.size(s.string(), 6, 72),
  name: s.size(s.string(), 1, 30),
  company: s.optional(s.size(s.string(), 1, 60)),
});

export const CreateJobInput = s.object({
  title: s.size(s.string(), 5, 60),
  company: s.size(s.string(), 1, 60),
  location: s.size(s.string(), 1, 60),
  category: s.enums(CATEGORIES),
  employmentType: s.enums(EMPLOYMENT_TYPES),
  salary: s.optional(s.nullable(s.min(s.max(s.integer(), 100_000), 0))),
  description: s.size(s.string(), 20, 5000),
  requirements: s.optional(s.array(s.size(s.string(), 1, 200))),
  benefits: s.optional(s.array(s.size(s.string(), 1, 200))),
});

export const CreateApplicationInput = s.object({
  jobId: s.size(s.string(), 1, 40),
  name: s.size(s.string(), 2, 30),
  email: Email,
  phone: s.optional(s.nullable(Phone)),
  message: s.optional(s.nullable(s.size(s.string(), 0, 500))),
});

export const WaitlistInput = s.object({
  email: Email,
  company: s.optional(s.nullable(s.size(s.string(), 1, 60))),
});
