/**
 * localStorage 어댑터.
 * 백엔드가 없는 MVP이므로 브라우저 저장소를 유일한 영속 계층으로 쓴다.
 * 시크릿 모드·용량 초과·JSON 파손 등 실패를 삼키고 기본값으로 되돌려,
 * 저장소 문제 하나가 화면 전체를 깨뜨리지 않게 한다.
 */

const PREFIX = "linkple";

export const STORAGE_KEYS = {
  jobs: `${PREFIX}.jobs.v1`,
  applications: `${PREFIX}.applications.v1`,
  auth: `${PREFIX}.auth.v1`,
};

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* 지울 수 없어도 흐름은 계속 진행한다 */
  }
}
