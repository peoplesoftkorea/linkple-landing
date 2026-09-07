// 로컬 개발용 진입점 — `npm run api`
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Linkple API — http://localhost:${PORT}`));
