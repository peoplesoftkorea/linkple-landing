import { Router } from 'express';
import * as s from 'superstruct';
import { prisma } from '../lib/prisma.js';
import { WaitlistInput } from '../validate.js';

const router = Router();

// 사전 신청. 같은 이메일로 두 번 눌러도 실패로 보이지 않게 한다 —
// 신청자에게 "이미 했다"는 건 실패가 아니라 이미 이룬 상태다.
router.post('/', async (req, res) => {
  s.assert(req.body, WaitlistInput);
  const { email, company } = req.body;

  const entry = await prisma.waitlistEntry.upsert({
    where: { email: email.trim() },
    update: { company: company?.trim() || undefined },
    create: { email: email.trim(), company: company?.trim() || null },
  });
  res.status(201).send({ id: entry.id, email: entry.email, createdAt: entry.createdAt });
});

export default router;
