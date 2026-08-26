// 초기 데이터 — `npm run db:seed`
//
// 미션6가 localStorage 에 심던 공고 10건을 그대로 DB 로 옮긴다.
// 화면이 비어 있으면 "만들다 만 서비스"로 보인다. 첫 방문자가 보는 것은 기능이 아니라 상태다.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { SEED_JOBS } from '../src/data/seedJobs.js';

const prisma = new PrismaClient();

// 데모 계정 — 멘토가 로그인해서 등록·삭제까지 눌러볼 수 있어야 한다.
const DEMO = { email: 'demo@linkple.kr', password: 'linkple2026', name: '데모 담당자', company: '링플' };

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Application", "Job", "WaitlistEntry", "User" RESTART IDENTITY CASCADE',
  );

  const demo = await prisma.user.create({
    data: {
      email: DEMO.email,
      passwordHash: await bcrypt.hash(DEMO.password, 10),
      name: DEMO.name,
      company: DEMO.company,
    },
  });

  for (const job of SEED_JOBS) {
    // source·createdAt 은 서버 기준으로 다시 정한다.
    const { id, source: _source, createdAt, ...rest } = job;
    await prisma.job.create({
      data: {
        ...rest,
        id,                                   // 미션6가 쓰던 문자열 id 를 그대로 유지한다
        source: 'seed',
        createdAt: new Date(createdAt),
        updatedAt: new Date(createdAt),
        authorId: demo.id,                    // 데모 계정이 올린 것으로 둔다
      },
    });
  }

  // 지원 내역 두 건 — 목록 화면이 빈 표로 보이지 않게.
  const [first, second] = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  await prisma.application.createMany({
    data: [
      { jobId: first.id,  name: '김지원', email: 'jiwon@example.com', phone: '010-1234-5678',
        message: '공고를 보고 지원합니다. 채용 설계 경험을 자세히 말씀드리고 싶습니다.',
        createdAt: new Date('2026-08-22T10:15:00+09:00') },
      { jobId: second.id, name: '이서준', email: 'seojun@example.com',
        createdAt: new Date('2026-08-24T16:40:00+09:00') },
    ],
  });

  const [u, j, a] = await Promise.all([prisma.user.count(), prisma.job.count(), prisma.application.count()]);
  console.log(`시딩 완료 — User ${u} · Job ${j} · Application ${a}`);
  console.log(`데모 계정: ${DEMO.email} / ${DEMO.password}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
