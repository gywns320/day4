import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { useCart, won } from '../lib/cart.jsx';

export default function Cart() {
  const { items, loading, error, count, total, setQty, remove } = useCart();
  const [msg, setMsg] = useState('');

  const run = async (fn) => {
    const err = await fn();
    if (err) setMsg(`⚠️ ${err}`);
  };

  return (
    <section className="section">
      <h2>🛒 장바구니</h2>
      {loading && items.length === 0 && <p className="center-note">불러오는 중…</p>}
      {error && <p className="center-note error">⚠️ {error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="center-note">
          장바구니가 비어 있어요. <Link to="/shop">특산품 보러 가기</Link>
        </p>
      )}

      {items.length > 0 && (
        <div className="cart">
          <ul className="cart-list">
            {items.map((it) => (
              <li className="cart-row" key={it.id}>
                <ProductImage product={it.product} className="cart-img" />
                <div className="cart-info">
                  <h3>{it.product.name}</h3>
                  <p>{won(it.product.price)}</p>
                </div>
                <div className="qty">
                  <button aria-label="수량 줄이기" disabled={it.quantity <= 1} onClick={() => run(() => setQty(it, it.quantity - 1))}>−</button>
                  <span>{it.quantity}</span>
                  <button aria-label="수량 늘리기" disabled={it.quantity >= 99} onClick={() => run(() => setQty(it, it.quantity + 1))}>+</button>
                </div>
                <strong className="line-total">{won(it.product.price * it.quantity)}</strong>
                <button className="remove" aria-label="삭제" onClick={() => run(() => remove(it))}>✕</button>
              </li>
            ))}
          </ul>

          <aside className="summary">
            <p>총 <b>{count}</b>개</p>
            <p className="sum-total">{won(total)}</p>
            <button className="btn big" onClick={() => setMsg('🧪 데모 사이트라 결제는 연결되어 있지 않아요. (주문·결제는 다음 단계!)')}>
              주문하기
            </button>
            {msg && <p className="hint-dark">{msg}</p>}
          </aside>
        </div>
      )}
    </section>
  );
}
