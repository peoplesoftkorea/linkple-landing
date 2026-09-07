// Prisma 클라이언트 — 하나만 만든다.
//
// 서버리스에서는 요청마다 모듈이 다시 평가될 수 있어, 그때마다 new PrismaClient()
// 를 하면 커넥션이 계속 늘어나 DB가 먼저 지친다. 전역에 담아 재사용한다.
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__linkplePrisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__linkplePrisma = prisma;
