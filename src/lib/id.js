/** 백엔드가 없으므로 식별자는 클라이언트에서 만든다. */
export function createId(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
