// Vercel 서버리스 진입점.
// vercel.json 이 /api/* 를 이 파일로 보내고, Express 가 나머지를 처리한다.
import app from '../server/app.js';

export default app;
