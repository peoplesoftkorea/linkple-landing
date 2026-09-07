import { Router } from 'express';
import * as s from 'superstruct';
import { prisma } from '../lib/prisma.js';
import { requireAuth, httpError } from '../middlewares.js';
import { CreateJobInput } from '../validate.js';

const router = Router();

const ORDER = {
  latest: [{ createdAt: 'desc' }],
  salary: [{ salary: 'desc' }, { createdAt: 'desc' }],   // 동점이면 최신순
  title:  [{ title: 'asc' }],
};

// 목록 — 검색·필터·정렬·페이지네이션
router.get('/', async (req, res) => {
  const { q, category, employmentType, sort = 'latest', page = '1', pageSize = '20' } = req.query;

  const where = {
    ...(category ? { category } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(q
      ? {
          OR: [
            // PostgreSQL 은 대소문자를 구분한다. 영문 검색이 되려면 insensitive 가 필요하다.
            { title:   { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { location:{ contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: ORDER[sort] ?? ORDER.latest,
      skip,
      take,
      // 목록에는 지원자 '수'만 필요하다. 지원 내역을 통째로 끌어오면 N+1 이 아니라
      // 한 번에 너무 많이 가져오는 쪽으로 무거워진다.
      include: { _count: { select: { applications: true } } },
    }),
  ]);

  res.send({ total, page: Number(page) || 1, pageSize: take, jobs });
});

// 상세
router.get('/:id', async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, name: true, company: true } },
      _count: { select: { applications: true } },
    },
  });
  if (!job) throw httpError(404, '공고를 찾을 수 없습니다.');
  res.send(job);
});

// 등록 — 로그인 필요
router.post('/', requireAuth, async (req, res) => {
  s.assert(req.body, CreateJobInput);
  const { requirements = [], benefits = [], salary, ...rest } = req.body;

  const job = await prisma.job.create({
    data: {
      ...rest,
      salary: salary ?? null,
      requirements,
      benefits,
      source: 'user',
      authorId: res.locals.user.id,
    },
  });
  res.status(201).send(job);
});

// 삭제 — 본인이 올린 공고만
router.delete('/:id', requireAuth, async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw httpError(404, '공고를 찾을 수 없습니다.');
  if (job.authorId && job.authorId !== res.locals.user.id) {
    throw httpError(403, '내가 올린 공고만 삭제할 수 있습니다.');
  }
  // 지원 내역은 스키마의 Cascade 가 함께 정리한다.
  await prisma.job.delete({ where: { id: req.params.id } });
  res.sendStatus(204);
});

export default router;
