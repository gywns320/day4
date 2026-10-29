import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authErrorMessage, useAuth } from '../lib/auth.jsx';
import { supabaseReady } from '../lib/supabase.js';

export default function Signup() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user && !sent) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 해요.');
    if (password !== confirm) return setError('비밀번호 확인이 일치하지 않아요.');
    setBusy(true);
    const { data, error: err } = await signUp(email.trim(), password, nickname.trim());
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    // 이미 가입된 이메일이면 Supabase는 에러 대신 identities 가 빈 사용자를 돌려줍니다.
    if (data.user && data.user.identities?.length === 0) return setError('이미 가입된 이메일이에요. 로그인해 주세요.');
    if (data.session) navigate('/', { replace: true }); // 이메일 인증을 끈 경우: 바로 로그인됨
    else setSent(true); // 이메일 인증을 켠 경우: 메일 확인 안내
  };

  if (sent) {
    return (
      <section className="auth-box">
        <h2>📬 메일을 확인해 주세요</h2>
        <p><b>{email}</b> 로 인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 완료돼요.</p>
        <p className="hint">메일이 안 보이면 스팸함도 확인해 보세요.</p>
        <Link className="btn big" to="/login">로그인 화면으로</Link>
      </section>
    );
  }

  return (
    <section className="auth-box">
      <h2>회원가입</h2>
      <form onSubmit={onSubmit}>
        <label>
          닉네임
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} required maxLength={20} placeholder="예: 감귤러버" />
        </label>
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          비밀번호 (6자 이상)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        <label>
          비밀번호 확인
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn big" disabled={busy || !supabaseReady}>{busy ? '가입 중…' : '가입하기'}</button>
      </form>
      <p className="switch">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
    </section>
  );
}
