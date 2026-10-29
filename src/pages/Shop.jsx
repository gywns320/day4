import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../lib/auth.jsx';
import { useCart, won } from '../lib/cart.jsx';

export default function Shop() {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from('products')
      .select('*')
      .order('id')
      .then(({ data, error: err }) => {
        if (err) setError(err.message.includes('does not exist') || err.code === 'PGRST205' ? 'products 테이블이 없어요. supabase/cart.sql 을 SQL Editor에서 실행해 주세요.' : err.message);
        else setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 1800);
  };

  const onAdd = async (p) => {
    if (!user) {
      navigate('/login', { state: { from: '/shop' } });
      return;
    }
    setBusyId(p.id);
    const err = await add(p);
    setBusyId(null);
    showToast(err ? `⚠️ ${err}` : `🛒 "${p.name}" 담았어요`);
  };

  return (
    <section className="section">
      <h2>🛍️ 제주 특산품</h2>
      {loading && <p className="center-note">불러오는 중…</p>}
      {error && <p className="center-note error">⚠️ {error}</p>}
      {!loading && !error && products.length === 0 && <p className="center-note">판매 중인 상품이 없어요.</p>}
      <div className="products">
        {products.map((p) => (
          <article className="product" key={p.id}>
            <ProductImage product={p} />
            <div className="product-body">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="product-foot">
                <strong>{won(p.price)}</strong>
                <button className="btn" disabled={busyId === p.id} onClick={() => onAdd(p)}>
                  {busyId === p.id ? '담는 중…' : '🛒 담기'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}
