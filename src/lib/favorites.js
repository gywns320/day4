import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase.js';
import { useAuth } from './auth.jsx';

// 로그인한 사용자의 즐겨찾기(하트) 목록. RLS 덕분에 본인 것만 조회·수정됩니다.
export function useFavorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    if (!user || !supabase) {
      setIds(new Set());
      return;
    }
    supabase
      .from('favorites')
      .select('image_id')
      .then(({ data }) => setIds(new Set((data || []).map((r) => r.image_id))));
  }, [user]);

  // 성공하면 null, 실패하면 에러 메시지를 돌려줍니다.
  const toggle = useCallback(
    async (hit) => {
      if (!user || !supabase) return '로그인이 필요해요.';
      const has = ids.has(hit.id);
      const { error } = has
        ? await supabase.from('favorites').delete().eq('image_id', hit.id)
        : await supabase.from('favorites').insert({
            image_id: hit.id,
            preview_url: hit.preview,
            large_url: hit.large,
            page_url: hit.pageURL,
            tags: hit.tags,
          });
      if (error) return error.message;
      setIds((prev) => {
        const next = new Set(prev);
        if (has) next.delete(hit.id);
        else next.add(hit.id);
        return next;
      });
      return null;
    },
    [user, ids]
  );

  return { ids, toggle };
}
