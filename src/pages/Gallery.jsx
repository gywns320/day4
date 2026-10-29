import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCard from '../components/ImageCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { searchImages } from '../lib/images.js';
import { useFavorites } from '../lib/favorites.js';
import { useAuth } from '../lib/auth.jsx';
import { TAGS } from '../data/places.js';

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ids, toggle } = useFavorites();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('jeju island');
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    searchImages(query, 24)
      .then((h) => alive && setHits(h))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  const onFav = async (hit) => {
    if (!user) {
      navigate('/login', { state: { from: '/gallery' } });
      return;
    }
    const err = await toggle(hit);
    setToast(err ? `⚠️ ${err}` : ids.has(hit.id) ? '즐겨찾기에서 뺐어요' : '즐겨찾기에 담았어요 ♥');
    setTimeout(() => setToast(''), 1800);
  };

  const onSearch = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (q) setQuery(/jeju|제주/i.test(q) ? q : `jeju ${q}`);
  };

  return (
    <section className="section">
      <h2>📸 제주 갤러리</h2>
      <form className="search" onSubmit={onSearch}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="영어로 검색해 보세요 (예: sunset, horse, waterfall)" />
        <button className="btn">검색</button>
      </form>
      <div className="tags">
        {TAGS.map((t) => (
          <button key={t.query} className={`chip ${query === t.query ? 'on' : ''}`} onClick={() => setQuery(t.query)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="center-note">사진을 불러오는 중… 🌊</p>}
      {error && <p className="center-note error">⚠️ {error}</p>}
      {!loading && !error && hits.length === 0 && <p className="center-note">검색 결과가 없어요. 다른 단어로 찾아보세요.</p>}

      <div className="grid">
        {hits.map((h) => (
          <ImageCard key={h.id} hit={h} fav={ids.has(h.id)} onFav={onFav} onOpen={setOpen} />
        ))}
      </div>
      <Lightbox hit={open} onClose={() => setOpen(null)} />
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}
