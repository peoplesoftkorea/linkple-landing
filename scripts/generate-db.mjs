/**
 * db.json(JSON Server용 Mock DB)을 시드 데이터에서 다시 만든다.
 * 시드가 두 곳에 흩어져 서로 어긋나는 것을 막기 위해, 정본은 src/data/seedJobs.js 하나다.
 *
 *   npm run seed:db
 */
import { writeFileSync } from "node:fs";
import { SEED_JOBS } from "../src/data/seedJobs.js";

writeFileSync("db.json", `${JSON.stringify({ jobs: SEED_JOBS, applications: [] }, null, 2)}\n`);
console.log(`db.json을 다시 만들었습니다. (공고 ${SEED_JOBS.length}건)`);
