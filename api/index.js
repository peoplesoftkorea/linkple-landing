// Vercel 서버리스 진입점.
//
// vercel.json 이 /api/* 를 이 파일로 보내는데, 서버리스는 nginx 와 달리
// 접두어를 벗겨 주지 않는다 — 함수가 받는 경로는 `/api/jobs` 그대로다.
// 그래서 여기서 `/api` 아래에 앱을 마운트한다. 로컬(server/index.js)과
// GCP(nginx proxy_pass 가 접두어를 벗김)는 접두어 없는 경로를 그대로 쓴다.
import express from 'express';
import app from '../server/app.js';

const entry = express();
entry.use('/api', app);

export default entry;
