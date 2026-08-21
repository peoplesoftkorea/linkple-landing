import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Node 26은 자체 localStorage를 globalThis에 올려 두는데, 실행 플래그 없이는 쓸 수 없다.
 * 그 값이 jsdom의 것을 가려 테스트에서 저장소가 사라진다.
 * 앱 코드가 기대하는 Storage 인터페이스를 테스트 환경에 직접 세워 준다.
 */
function createMemoryStorage() {
  let store = new Map();
  return {
    get length() {
      return store.size;
    },
    key: (index) => [...store.keys()][index] ?? null,
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => {
      store = new Map();
    },
  };
}

if (!window.localStorage?.setItem) {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
