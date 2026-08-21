/** 화면 표기 형식을 한곳에 모은다. 같은 값이 화면마다 달리 보이지 않도록. */

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** 오늘 기준 상대 표기. 목록에서 신선도를 한눈에 보기 위한 것. */
export function formatRelative(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return formatDate(iso);
}

/** 만 단위 연봉을 사람이 읽는 문장으로. 0/미입력은 '회사 내규'로 표기. */
export function formatSalary(manwon) {
  const n = Number(manwon);
  if (!n) return "회사 내규에 따름";
  if (n >= 10_000) {
    const eok = Math.floor(n / 10_000);
    const rest = n % 10_000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${n.toLocaleString()}만원`;
}

export function maskEmail(email) {
  const [id, domain] = String(email).split("@");
  if (!domain) return email;
  const head = id.slice(0, 2);
  return `${head}${"*".repeat(Math.max(id.length - 2, 1))}@${domain}`;
}
