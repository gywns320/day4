import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { supabaseReady } from '../lib/supabase.js';

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(authErrorMessage(err));
    else navigate(from, { replace: true });
  };

  return (
    <section className="auth-box">
      <h2>로그인</h2>
      <form onSubmit={onSubmit}>
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          비밀번호
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn big" disabled={busy || !supabaseReady}>{busy ? '확인 중…' : '로그인'}</button>
      </form>
      <p className="switch">처음이신가요? <Link to="/signup">회원가입</Link></p>
    </section>
  );
}
