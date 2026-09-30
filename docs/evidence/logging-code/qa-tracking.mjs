// 로그 QA(층 1) — Tracking Plan 문서 · EVENTS 상수 · 실제 호출부를 셋 다 대조한다.
//
// ★왜 필요한가 — 「설계했다」가 「찍힌다」를 뜻하지 않는다. 설계서에만 있는 이벤트는 값이 0으로
//   나오는데, 그 0 은 **「행동이 없었다」와 구별되지 않는다.** 그래서 사람 기억이 아니라 검사로 막는다.
//
// ⛔검사기 자체를 먼저 시험한다 — 없는 이름을 주입해 «잡히는지» 확인한 뒤 결과를 믿는다.
//   측정기가 대상을 놓치면 「문제 0건」이 나오고, 그것이 가장 위험한 보고다.
//
// 실행: npm run qa:tracking

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ANALYTICS = "src/lib/analytics.js";
const PLAN = "docs/MISSION9-1-TRACKING-PLAN.md";

let pass = 0;
let fail = 0;
const ck = (label, ok, note = "") => {
  (ok ? pass++ : fail++);
  console.log(`  ${ok ? "OK " : "🔴 "} ${label}${note ? ` — ${note}` : ""}`);
};

// ── ⑴ 상수(EVENTS) ─────────────────────────────────────────────────────────
const src = readFileSync(join(root, ANALYTICS), "utf8");
const block = src.match(/export const EVENTS = \{([\s\S]*?)\n\};/);
if (!block) {
  console.log(`🔴 ${ANALYTICS} 에서 EVENTS 를 찾지 못했다 — 검사기가 대상을 놓쳤다(통과가 아니다)`);
  process.exit(2);
}
const CONST = new Map(
  [...block[1].matchAll(/^\s*([A-Z0-9_]+):\s*"([a-z0-9_]+)"/gm)].map((m) => [m[1], m[2]]),
);

// ── ⑵ 호출부 — track(EVENTS.X) / 문자열 직접 호출 ──────────────────────────
const files = [];
const walk = (d) => {
  for (const name of readdirSync(d)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(d, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(js|jsx)$/.test(name) && !full.endsWith(ANALYTICS)) files.push(full);
  }
};
walk(join(root, "src"));

const calledKeys = new Set();
const literalCalls = [];
for (const f of files) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/track\(\s*EVENTS\.([A-Z0-9_]+)/g)) calledKeys.add(m[1]);
  for (const m of t.matchAll(/\btrack\(\s*["']([a-z0-9_]+)["']/g)) {
    literalCalls.push(`${m[1]}(${f.replace(root + "/", "")})`);
  }
}
// page_view 는 전용 함수(trackPageView)로 나간다 — 호출된 것으로 센다.
if (/export function trackPageView/.test(src)) calledKeys.add("PAGE_VIEW");

// ── ⑶ 문서(Tracking Plan) 표에 적힌 이벤트 ─────────────────────────────────
const plan = readFileSync(join(root, PLAN), "utf8");
const DOC = new Set([...plan.matchAll(/^\|\s*\d+\s*\|\s*★?`([a-z0-9_]+)`/gm)].map((m) => m[1]));

// ── 검사 ───────────────────────────────────────────────────────────────────
console.log("══ 로그 QA — Tracking Plan ↔ 상수 ↔ 호출부\n");

// 자기 시험(대조군): 검사 논리가 «없는 것»을 실제로 집어내는가
{
  const fakeConst = new Map([...CONST, ["FAKE_ONLY_DEFINED", "fake_only_defined"]]);
  const caught = [...fakeConst.keys()].filter((k) => !calledKeys.has(k));
  ck("대조군 — 정의만 있고 부르지 않는 이벤트를 집어낸다", caught.includes("FAKE_ONLY_DEFINED"),
     `주입 결과 ${caught.length}건 검출`);
  const docCaught = [...DOC, "fake_doc_only"].filter((n) => ![...CONST.values()].includes(n));
  ck("대조군 — 문서에만 있는 이벤트를 집어낸다", docCaught.includes("fake_doc_only"));
}

const notCalled = [...CONST.entries()].filter(([k]) => !calledKeys.has(k)).map(([, v]) => v);
ck(`정의한 이벤트를 모두 «부르고 있다» — 정의 ${CONST.size}종 / 소스 ${files.length}파일`,
   notCalled.length === 0, notCalled.length ? `안 부르는 것: ${notCalled.join(", ")}` : "설계만 남은 이벤트 없음");

const names = new Set(CONST.values());
const docOnly = [...DOC].filter((n) => !names.has(n));
ck(`문서의 이벤트가 모두 상수에 있다 — 문서 ${DOC.size}종`, docOnly.length === 0,
   docOnly.length ? `문서에만 있음: ${docOnly.join(", ")}` : "");

const codeOnly = [...names].filter((n) => !DOC.has(n));
ck("상수의 이벤트가 모두 문서에 있다", codeOnly.length === 0,
   codeOnly.length ? `문서에 없음: ${codeOnly.join(", ")}` : "문서가 코드를 따라오고 있다");

ck("문자열을 직접 넘긴 호출이 없다", literalCalls.length === 0,
   literalCalls.length ? literalCalls.join(" · ") : "이름은 EVENTS 상수로만 쓴다");

// 완료형 이벤트는 «성공 뒤»에 보내야 한다 — await 다음 줄에 있는지 본다
{
  const late = [];
  for (const key of ["APPLY_SUBMITTED", "JOB_POSTED"]) {
    let ok = false;
    for (const f of files) {
      const t = readFileSync(f, "utf8");
      const i = t.indexOf(`EVENTS.${key}`);
      if (i < 0) continue;
      // 같은 함수 안에서 이 호출 «앞»에 await 가 있는가(= 저장을 기다린 뒤인가)
      ok = /await [^\n]*\n[\s\S]{0,400}$/.test(t.slice(Math.max(0, i - 600), i));
    }
    if (!ok) late.push(key);
  }
  ck("완료형 이벤트는 저장을 기다린 뒤에 보낸다", late.length === 0,
     late.length ? `확인 필요: ${late.join(", ")}` : "apply_submitted · job_posted 둘 다 await 뒤");
}

// 속성에 식별 정보가 실리지 않는가
{
  // ⛔«키»만 본다. 값으로 들어간 "email"(예: `method: "email"`)을 키로 읽으면 전건 오탐이다
  //   [자가 적발 2026-09-30 — 첫 판은 method 값에 걸려 붉어졌다].
  const PII = ["email", "tel", "phone", "mobile", "applicantEmail", "applicantName", "birth", "ssn"];
  const hits = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    for (const m of t.matchAll(/track\([^)]*\{([\s\S]{0,300}?)\}\s*\)/g)) {
      for (const k of PII) {
        if (new RegExp(`(^|[{,\\s])${k}\\s*:`).test(m[1])) hits.push(`${k}(${f.replace(root + "/", "")})`);
      }
    }
  }
  // 자기 시험 — 키 형태를 실제로 집어내는가(값 형태는 무시하는가)
  const baitKey = /(^|[{,\s])email\s*:/.test(`{ email: form.email }`);
  const baitVal = /(^|[{,\s])email\s*:/.test(`{ method: "email" }`);
  ck("대조군 — PII 판정이 «키»만 본다", baitKey && !baitVal, `키 검출=${baitKey} · 값 오탐=${baitVal}`);
  ck("이벤트 속성에 식별 정보가 없다", hits.length === 0,
     hits.length ? hits.join(" · ") : "길이·여부·분류만 싣는다");
}

console.log(`\n════ 로그 QA ${pass + fail}항 — 통과 ${pass} / 실패 ${fail}`);
if (fail === 0) console.log("   ※ 대조군 2항이 먼저 «잡히는 것»을 확인했으므로 0건은 실제로 잰 결과다.");
process.exit(fail ? 1 : 0);
