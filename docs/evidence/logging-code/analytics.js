// 계측 모듈 — 미션 9-1(지표·로그 설계 → Amplitude 로깅 · GA4 · UTM)
//
// ★설계 원칙 3가지
//  ⑴ **이벤트 이름은 여기 한 곳에만 적는다**(EVENTS). 화면에서 문자열을 직접 쓰면 오타가 조용히
//     새 이벤트를 만들고, 그 이벤트는 「행동이 없었다」와 구별되지 않는다.
//  ⑵ **「정의했다」와 「찍힌다」를 구별한다.** 설계한 이벤트가 실제로 코드에서 불리는지는
//     `npm run qa:tracking` 이 소스를 훑어 대조한다(사람 기억에 맡기지 않는다).
//  ⑶ **키가 없으면 조용히 실패하지 않는다.** 개발 중에는 콘솔과 `window.__LOG_QA` 에 남겨
//     로그 QA 를 키 없이도 할 수 있게 한다.
//
// ⚠️미션(학습) 전용이다. 사업 계측(linkple.kr)과 계정·속성을 섞지 않는다 — 측정 ID·API 키는
//   이 앱만의 것을 넣는다.

import * as amplitude from "@amplitude/analytics-browser";

/** 이벤트 정의서(SSOT). 화면 코드는 반드시 이 상수를 쓴다. */
export const EVENTS = {
  PAGE_VIEW: "page_view",
  JOB_LIST_VIEWED: "job_list_viewed",
  JOB_SEARCH_USED: "job_search_used",
  JOB_DETAIL_VIEWED: "job_detail_viewed",
  LOGIN_STARTED: "login_started",
  LOGIN_COMPLETED: "login_completed",
  APPLY_STARTED: "apply_started",
  APPLY_SUBMITTED: "apply_submitted", // ★구직자 Aha
  JOB_NEW_OPENED: "job_new_opened",
  AI_DRAFT_REQUESTED: "ai_draft_requested",
  AI_DRAFT_ACCEPTED: "ai_draft_accepted",
  JOB_POSTED: "job_posted", // ★구인자 Aha
  APPLICATION_LIST_VIEWED: "application_list_viewed",
};

const AMPLITUDE_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY ?? "";
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "";
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_TRACK_DEBUG === "1";

let ready = false;

/** 로그 QA 용 — 이 세션에서 «실제로 보낸» 이벤트를 순서대로 쌓는다. */
function record(name, props, sinks) {
  if (typeof window === "undefined") return;
  window.__LOG_QA = window.__LOG_QA || [];
  window.__LOG_QA.push({ at: new Date().toISOString(), name, props, sinks });
  if (DEBUG) console.log(`[track] ${name}`, { props, sinks: sinks.join("+") || "(없음)" });
}

// ── UTM ────────────────────────────────────────────────────────────────────
// ★UTM 은 «첫 방문»의 값을 남긴다. 나중 페이지 이동에서 쿼리가 사라지면 유입 경로가 지워진다.
//   ⇒ 처음 본 값을 sessionStorage 에 넣고 그 값을 User Property 로 올린다.
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const UTM_STORE = "mission9_utm";

export function captureUtm() {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const fromUrl = {};
  for (const k of UTM_KEYS) {
    const v = q.get(k);
    if (v) fromUrl[k] = v.slice(0, 80);
  }
  if (Object.keys(fromUrl).length) {
    sessionStorage.setItem(UTM_STORE, JSON.stringify(fromUrl));
    return fromUrl;
  }
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORE) || "{}");
  } catch {
    return {};
  }
}

/** referrer 를 3값으로만 접는다 — 전체 URL 은 싣지 않는다(검색어가 실린다). */
export function referrerKind() {
  try {
    const r = document.referrer;
    if (!r) return "direct";
    return new URL(r).host === window.location.host ? "internal" : "external";
  } catch {
    return "direct";
  }
}

// ── 초기화 ─────────────────────────────────────────────────────────────────
export function initAnalytics() {
  if (ready || typeof window === "undefined") return;
  ready = true;

  if (AMPLITUDE_KEY) {
    amplitude.init(AMPLITUDE_KEY, {
      // 자동 수집은 «페이지 이동»만 켠다. 나머지는 설계한 이벤트로 보낸다.
      autocapture: { attribution: true, pageViews: false, sessions: true, formInteractions: false, fileDownloads: false },
      defaultTracking: false,
    });
  } else if (DEBUG) {
    console.warn("[track] VITE_AMPLITUDE_API_KEY 없음 — 전송 없이 콘솔·__LOG_QA 에만 남긴다");
  }

  if (GA4_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    // ★수동 page_view — SPA 는 라우트가 바뀌어도 문서가 다시 열리지 않는다.
    window.gtag("config", GA4_ID, { send_page_view: false });
  } else if (DEBUG) {
    console.warn("[track] VITE_GA4_MEASUREMENT_ID 없음 — GA4 전송 없음");
  }

  const utm = captureUtm();
  setUserProps({ ...utm, first_referrer_kind: referrerKind(), device: deviceKind() });
}

function deviceKind() {
  if (typeof window === "undefined") return "unknown";
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

// ── User Property ──────────────────────────────────────────────────────────
export function setUserProps(props = {}) {
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  if (!Object.keys(clean).length) return;
  if (AMPLITUDE_KEY) {
    const id = new amplitude.Identify();
    for (const [k, v] of Object.entries(clean)) id.set(k, v);
    amplitude.identify(id);
  }
  if (GA4_ID && window.gtag) window.gtag("set", "user_properties", clean);
  record("(user_properties)", clean, ["property"]);
}

/** 로그인한 사용자를 «사람»으로 묶는다. ⛔이메일·이름 같은 식별 정보는 싣지 않는다. */
export function identifyUser(user) {
  if (!user) return;
  if (AMPLITUDE_KEY) amplitude.setUserId(String(user.id));
  setUserProps({ role: user.role ?? "seeker", is_logged_in: true });
}

export function resetUser() {
  if (AMPLITUDE_KEY) amplitude.reset();
  setUserProps({ is_logged_in: false });
}

// ── 이벤트 전송 ────────────────────────────────────────────────────────────
const KNOWN = new Set(Object.values(EVENTS));

export function track(name, props = {}) {
  // ⛔정의서 밖 이름은 보내지 않고 «시끄럽게» 알린다 — 조용히 보내면 오타가 새 이벤트가 된다.
  if (!KNOWN.has(name)) {
    console.error(`[track] 정의서에 없는 이벤트: ${name} — src/lib/analytics.js EVENTS 에 먼저 넣는다`);
    return;
  }
  const utm = captureUtm();
  const payload = { ...props, ...utm };
  const sinks = [];
  if (AMPLITUDE_KEY) { amplitude.track(name, payload); sinks.push("amplitude"); }
  if (GA4_ID && window.gtag) { window.gtag("event", name, payload); sinks.push("ga4"); }
  record(name, payload, sinks);
}

/** SPA 페이지뷰 — 라우트가 바뀔 때마다 부른다. */
export function trackPageView(path) {
  const payload = { path, referrer_kind: referrerKind(), ...captureUtm() };
  const sinks = [];
  if (AMPLITUDE_KEY) { amplitude.track(EVENTS.PAGE_VIEW, payload); sinks.push("amplitude"); }
  if (GA4_ID && window.gtag) {
    window.gtag("event", "page_view", { page_path: path, ...captureUtm() });
    sinks.push("ga4");
  }
  record(EVENTS.PAGE_VIEW, payload, sinks);
}
