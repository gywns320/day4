import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';

export default function Header() {
  const { user, nickname, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const onLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">🍊 놀멍쉬멍 제주</Link>
      <nav className="nav">
        <NavLink to="/" end>홈</NavLink>
        <NavLink to="/gallery">갤러리</NavLink>
        <NavLink to="/shop">특산품</NavLink>
        <NavLink to="/favorites">내 즐겨찾기</NavLink>
      </nav>
      <div className="auth">
        <Link className="cart-link" to="/cart" aria-label={`장바구니 ${count}개`}>
          🛒{count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
        </Link>
        {user ? (
          <>
            <span className="hello">👋 {nickname}님</span>
            <button className="btn ghost" onClick={onLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">로그인</Link>
            <Link className="btn" to="/signup">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}
