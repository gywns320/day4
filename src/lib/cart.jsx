import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';
import { useAuth } from './auth.jsx';

const CartContext = createContext(null);

const MISSING_TABLE = 'cart_items 테이블이 없어요. supabase/cart.sql 을 SQL Editor에서 실행했는지 확인해 주세요.';
const toMessage = (err) => (err.message?.includes('does not exist') || err.code === '42P01' || err.code === 'PGRST205' ? MISSING_TABLE : err.message);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user || !supabase) {
      setItems([]);
      setError('');
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(id, name, price, emoji, image_query)')
      .order('created_at');
    setLoading(false);
    if (err) setError(toMessage(err));
    else {
      setError('');
      setItems((data || []).filter((i) => i.product));
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // 성공하면 null, 실패하면 에러 메시지를 돌려줍니다.
  const add = useCallback(
    async (product, qty = 1) => {
      if (!user || !supabase) return '로그인이 필요해요.';
      const existing = items.find((i) => i.product.id === product.id);
      const { error: err } = existing
        ? await supabase.from('cart_items').update({ quantity: Math.min(99, existing.quantity + qty) }).eq('id', existing.id)
        : await supabase.from('cart_items').insert({ product_id: product.id, quantity: qty });
      if (err) return toMessage(err);
      await load();
      return null;
    },
    [user, items, load]
  );

  const setQty = useCallback(
    async (item, qty) => {
      const q = Math.max(1, Math.min(99, qty));
      const { error: err } = await supabase.from('cart_items').update({ quantity: q }).eq('id', item.id);
      if (err) return toMessage(err);
      await load();
      return null;
    },
    [load]
  );

  const remove = useCallback(
    async (item) => {
      const { error: err } = await supabase.from('cart_items').delete().eq('id', item.id);
      if (err) return toMessage(err);
      await load();
      return null;
    },
    [load]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
      add,
      setQty,
      remove,
    }),
    [items, loading, error, add, setQty, remove]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
