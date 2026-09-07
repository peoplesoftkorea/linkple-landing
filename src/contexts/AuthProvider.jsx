import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from "../lib/storage";
import { authApi } from "../data/repository";

/**
 * 실제 인증(미션7).
 * 미션6에서는 서버가 없어 "로그인한 척"만 했다. 이제는 서버가 비밀번호를 확인하고
 * 토큰을 내준다. 토큰은 localStorage에 담아 새로고침을 견디게 하고,
 * 요청을 보낼 때 repository가 꺼내 실어 보낸다.
 *
 * 저장하는 것은 세션(사용자 + 토큰)이지 비밀번호가 아니다.
 */

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
      // 서버가 계정과 비밀번호를 확인하고 토큰을 준다.
      // 실패 사유(없는 계정 / 틀린 비밀번호)는 서버가 구분해 알려주지 않는다 —
      // 구분해 주면 "이 이메일은 가입돼 있다"는 사실이 새어 나간다.
      const { user: account, token } = await authApi.login(email.trim(), password);
      const nextUser = { ...account, token, loggedInAt: new Date().toISOString() };
      setUser(nextUser);
      return nextUser;
    } finally {
      setPending(false);
    }
  }, []);

  const signup = useCallback(async (values) => {
    setPending(true);
    try {
      const { user: account, token } = await authApi.signup({
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim() || values.email.split("@")[0],
        company: values.company?.trim() || undefined,
      });
      const nextUser = { ...account, token, loggedInAt: new Date().toISOString() };
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
    () => ({ user, isAuthenticated: Boolean(user), pending, login, signup, logout }),
    [user, pending, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
