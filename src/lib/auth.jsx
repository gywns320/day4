import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }
    // 새로고침해도 로그인이 유지되도록 저장된 세션을 먼저 읽고,
    // 이후 로그인/로그아웃이 일어날 때마다 상태를 갱신합니다.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      nickname: session?.user?.user_metadata?.nickname || session?.user?.email?.split('@')[0] || '',
      signUp: (email, password, nickname) =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { nickname }, emailRedirectTo: window.location.origin },
        }),
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function authErrorMessage(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (m.includes('email not confirmed')) return '이메일 인증이 아직이에요. 메일함의 인증 링크를 눌러주세요.';
  if (m.includes('already registered')) return '이미 가입된 이메일이에요. 로그인해 주세요.';
  if (m.includes('password should be at least')) return '비밀번호는 6자 이상이어야 해요.';
  if (m.includes('rate limit')) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  return error?.message || '알 수 없는 오류가 발생했어요.';
}
