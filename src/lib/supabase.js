import { createClient } from '@supabase/supabase-js';

// Vercel 환경변수에 따옴표나 공백이 섞여 들어와도 견디도록 정리합니다.
const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '');
const url = clean(import.meta.env.VITE_SUPABASE_URL);
const key = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// 값이 없거나 URL 형식이 아니면 앱이 하얗게 죽는 대신 안내 배너를 보여주도록 null 로 둡니다.
export const supabaseReady = Boolean(key) && isHttpUrl(url);
export const supabase = supabaseReady ? createClient(url, key) : null;
