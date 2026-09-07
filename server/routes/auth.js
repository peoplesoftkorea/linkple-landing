import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as s from 'superstruct';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth, httpError } from '../middlewares.js';
import { LoginInput, SignupInput } from '../validate.js';

const router = Router();
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, company: u.company });

// 회원가입
router.post('/signup', async (req, res) => {
  s.assert(req.body, SignupInput);
  const { email, password, name, company } = req.body;

  // 비밀번호는 저장하지 않는다. 되돌릴 수 없는 해시만 남긴다.
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: email.trim(), passwordHash, name: name.trim(), company: company?.trim() },
  });
  res.status(201).send({ user: publicUser(user), token: signToken(user) });
});

// 로그인
router.post('/login', async (req, res) => {
  s.assert(req.body, LoginInput);
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  // 계정이 없는 것과 비밀번호가 틀린 것을 구분해 알려주지 않는다.
  // 구분해 주면 "이 이메일은 가입돼 있다"는 사실이 새어 나간다.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw httpError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');

  res.send({ user: publicUser(user), token: signToken(user) });
});

// 내 정보 — 토큰이 살아 있는지 확인하는 용도로도 쓴다.
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: res.locals.user.id } });
  if (!user) throw httpError(401, '세션이 만료되었습니다. 다시 로그인해 주세요.');
  res.send({ user: publicUser(user) });
});

export default router;
