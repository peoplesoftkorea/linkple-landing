// Linkple MVP API — Express 애플리케이션.
//
// listen() 은 여기서 부르지 않는다. 로컬에서는 server/index.js 가, 배포에서는
// Vercel 서버리스(api/index.js)가 이 앱을 받아 각자의 방식으로 띄운다.
import express from 'express';
import { logger, attachUser, notFound, errorHandler } from './middlewares.js';
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import waitlistRouter from './routes/waitlist.js';

const app = express();

// 순서가 곧 설계다.
app.use(logger);                 // 1. 기록
app.use(express.json());         // 2. 본문 파싱 — 라우트보다 먼저
app.use(attachUser);             // 3. 토큰이 있으면 사용자를 붙인다(없어도 통과)

app.get('/health', (req, res) => res.send({ ok: true, at: new Date().toISOString() }));

app.use('/auth', authRouter);
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/waitlist', waitlistRouter);

app.use(notFound);               // 4. 아무 라우트도 만나지 못한 요청
app.use(errorHandler);           // 5. 모든 에러의 종착지

export default app;
