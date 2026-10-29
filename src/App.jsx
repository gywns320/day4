import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import Favorites from './pages/Favorites.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { useAuth } from './lib/auth.jsx';
import { supabaseReady } from './lib/supabase.js';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="center-note">불러오는 중…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      {!supabaseReady && (
        <div className="banner">
          ⚙️ Supabase 환경변수(<code>VITE_SUPABASE_URL</code>은 <code>https://…supabase.co</code> 형태, <code>VITE_SUPABASE_ANON_KEY</code>)가
          없거나 형식이 올바르지 않아 로그인 기능이 꺼져 있어요. README의 설정 절차를 확인해 주세요.
        </div>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<p className="center-note">길을 잃었어요 🌀 <a href="/">홈으로</a></p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
