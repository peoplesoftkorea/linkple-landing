import { Router } from 'express';
import * as s from 'superstruct';
import { prisma } from '../lib/prisma.js';
import { requireAuth, httpError } from '../middlewares.js';
import { CreateApplicationInput } from '../validate.js';

const router = Router();

const withJob = { job: { select: { id: true, title: true, company: true, location: true } } };

// 지원하기 — 로그인 없이 가능하다. 구직자는 계정을 만들기 전에 먼저 지원한다.
router.post('/', async (req, res) => {
  s.assert(req.body, CreateApplicationInput);
  const { jobId, name, email, phone, message } = req.body;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw httpError(404, '지원하려는 공고를 찾을 수 없습니다.');

  // 같은 공고에 같은 이메일로 두 번. 스키마의 @@unique 가 막고 P2002 를 던지지만,
  // 여기서 미리 잡아 사람이 읽을 문장으로 바꾼다.
  const already = await prisma.application.findUnique({
    where: { jobId_email: { jobId, email: email.trim() } },
  });
  if (already) throw httpError(409, '이미 이 공고에 지원하셨습니다.');

  const application = await prisma.application.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      job: { connect: { id: jobId } },      // 외래키 대신 관계로 연결
    },
    include: withJob,
  });
  res.status(201).send(application);
});

/**
 * 내 지원 내역 — 내가 '낸' 지원서(구직자 관점).
 * 화면(「내 지원 내역」)이 로그인 계정의 이메일로 거르므로, 서버도 같은 기준을 쓴다.
 * 목록을 프론트에서 거르면 남의 지원서가 응답에 실려 나간 뒤 화면에서만 숨겨진다 —
 * 거르는 일은 서버가 해야 한다.
 */
router.get('/', requireAuth, async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { email: res.locals.user.email },
    orderBy: { createdAt: 'desc' },
    include: withJob,
  });
  res.send(applications);
});

/** 내가 '받은' 지원 — 내가 올린 공고에 들어온 것(구인자 관점). */
router.get('/received', requireAuth, async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { job: { authorId: res.locals.user.id } },
    orderBy: { createdAt: 'desc' },
    include: withJob,
  });
  res.send(applications);
});

// 지원 철회 — 본인이 낸 지원서만. 철회 후 같은 공고에 다시 지원할 수 있다.
router.delete('/:id', requireAuth, async (req, res) => {
  const app = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!app) throw httpError(404, '지원 내역을 찾을 수 없습니다.');
  if (app.email !== res.locals.user.email) throw httpError(403, '본인이 낸 지원서만 철회할 수 있습니다.');

  await prisma.application.delete({ where: { id: req.params.id } });
  res.sendStatus(204);
});

export default router;
