// 토큰 발급·검증.
//
// 학습용이라 대칭키(HS256) 한 개로 서명한다. 비밀키는 코드가 아니라 환경변수에서
// 온다 — 저장소에 올라간 비밀은 더 이상 비밀이 아니다.
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '2h';

if (!SECRET && process.env.NODE_ENV === 'production') {
  // 운영에서 비밀키 없이 뜨면 아무나 토큰을 위조할 수 있다. 조용히 넘기지 않는다.
  throw new Error('JWT_SECRET 환경변수가 없습니다.');
}

const key = SECRET ?? 'dev-only-insecure-secret';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, name: user.name }, key, { expiresIn: EXPIRES_IN });

export function verifyToken(token) {
  try {
    return jwt.verify(token, key);
  } catch {
    return null;                 // 만료·위조를 구분하지 않는다. 밖에서는 똑같이 401이다.
  }
}
