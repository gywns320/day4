import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchImages } from '../lib/images.js';
import { PLACES } from '../data/places.js';
import { useAuth } from '../lib/auth.jsx';

export default function Home() {
  const { user, nickname } = useAuth();
  const [hero, setHero] = useState(null);
  const [photos, setPhotos] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    searchImages('jeju island', 10)
      .then((hits) => alive && setHero(hits[0]))
      .catch((e) => alive && setError(e.message));
    PLACES.forEach((p) => {
      searchImages(p.query, 3)
        .then((hits) => (hits.length ? hits : searchImages('jeju island', 6)))
        .then((hits) => alive && setPhotos((prev) => ({ ...prev, [p.name]: hits[0] })))
        .catch(() => {});
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <section className="hero" style={hero ? { backgroundImage: `linear-gradient(#0b3a4a99,#0b3a4acc), url(${hero.large || hero.preview})` } : undefined}>
        <h1>놀멍 쉬멍, 제주</h1>
        <p>{user ? `${nickname}님, 오늘은 어디로 떠나볼까요?` : '바다와 오름과 감귤의 섬을 사진으로 먼저 만나보세요.'}</p>
        <div className="hero-actions">
          <Link className="btn big" to="/gallery">사진 구경하기</Link>
          {!user && <Link className="btn big ghost" to="/signup">무료 회원가입</Link>}
        </div>
        {error && <p className="hint">⚠️ {error}</p>}
      </section>

      <section className="section">
        <h2>🏝️ 제주 대표 명소</h2>
        <div className="places">
          {PLACES.map((p) => (
            <article className="place" key={p.name}>
              <div
                className="place-img"
                style={photos[p.name] ? { backgroundImage: `url(${photos[p.name].preview})` } : undefined}
                role="img"
                aria-label={p.name}
              />
              <div className="place-body">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {!user && (
        <section className="section cta">
          <h2>로그인하면 사진을 모아둘 수 있어요 ♥</h2>
          <p>마음에 드는 제주 사진에 하트를 눌러 나만의 여행 앨범을 만들어요.</p>
          <Link className="btn big" to="/signup">회원가입 하러 가기</Link>
        </section>
      )}
    </>
  );
}
