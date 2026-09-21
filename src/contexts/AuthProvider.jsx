import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from "../lib/storage";

/**
 * 로그인 시뮬레이션.
 * 서버가 없으므로 실제 인증은 하지 않는다. 대신 "로그인한 상태"라는 사실만
 * localStorage에 남겨, 새로고침해도 세션이 유지되는 경험을 만든다.
 * 데모 규칙: 형식이 맞는 이메일 + 6자 이상 비밀번호면 통과.
 */
const DEMO_PASSWORD_MIN = 6;
const FAKE_LATENCY_MS = 600;

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.auth, null));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) writeStorage(STORAGE_KEYS.auth, user);
    else removeStorage(STORAGE_KEYS.auth);
  }, [user]);

  const login = useCallback(async ({ email, password }) => {
    setPending(true);
    try {
      // 네트워크 지연을 흉내 내 로딩 상태가 실제로 보이게 한다.
      await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));

      if (!password || password.length < DEMO_PASSWORD_MIN) {
        throw new Error("비밀번호가 올바르지 않습니다. 6자 이상 입력해 주세요.");
      }

      const localPart = email.split("@")[0] ?? "담당자";
      const nextUser = {
        email,
        name: `${localPart} 님`,
        company: email.split("@")[1]?.split(".")[0] ?? "우리 회사",
        loggedInAt: new Date().toISOString(),
      };
      setUser(nextUser);
      return nextUser;
    } finally {
      setPending(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), pending, login, logout }),
    [user, pending, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
