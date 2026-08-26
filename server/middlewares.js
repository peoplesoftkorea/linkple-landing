// 요청과 응답 사이에 서는 것들.
import { StructError } from 'superstruct';
import { verifyToken } from './lib/jwt.js';

/** 모든 요청을 기록한다. 아래에서 무슨 일이 나든 흔적은 남아야 한다. */
export const logger = (req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - t0}ms)`);
  });
  next();
};

/**
 * 토큰이 있으면 사용자를 붙이고, 없으면 그냥 지나간다.
 * '누구인지 알면 좋지만 없어도 되는' 화면(공고 목록)에 쓴다.
 */
export const attachUser = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme === 'Bearer' && token) {
    const payload = verifyToken(token);
    if (payload) res.locals.user = { id: payload.sub, email: payload.email, name: payload.name };
  }
  next();
};

/** 토큰이 없으면 여기서 끊는다. 보호가 필요한 API 앞에 세운다. */
export const requireAuth = (req, res, next) => {
  if (!res.locals.user) {
    return res.status(401).send({ message: '로그인이 필요합니다.' });
  }
  next();
};

/** 어떤 라우트와도 만나지 못한 요청. ⚠️ Express 5 에서 app.all('*') 는 깨진다. */
export const notFound = (req, res) => {
  res.status(404).send({ message: `요청한 경로가 없습니다: ${req.method} ${req.originalUrl}` });
};

// Prisma 에러코드 → HTTP 상태코드.
const PRISMA = {
  P2025: [404, '대상을 찾을 수 없습니다.'],
  P2002: [409, '이미 등록된 값입니다.'],
  P2003: [400, '연결하려는 대상이 없습니다.'],
};

/**
 * 모든 에러의 종착지. 인자가 넷이어야 Express 가 에러 전용으로 알아본다.
 * 클라이언트에는 사람이 읽을 문장을, 서버 로그에는 원인을 남긴다.
 */
export const errorHandler = (err, req, res, _next) => {
  if (err instanceof StructError) {
    return res.status(400).send({
      message: '입력값을 확인해 주세요.',
      field: err.path.join('.') || undefined,
      detail: err.message,
    });
  }
  const hit = PRISMA[err.code];
  if (hit) return res.status(hit[0]).send({ message: hit[1], code: err.code });
  if (err.status) return res.status(err.status).send({ message: err.message });

  console.error(err);
  res.status(500).send({
    message: '서버에서 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/** 상태코드를 붙인 에러를 던지기 위한 도우미. */
export const httpError = (status, message) => Object.assign(new Error(message), { status });
