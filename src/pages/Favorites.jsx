import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageCard from '../components/ImageCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../lib/auth.jsx';

export default function Favorites() {
  const { nickname } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message.includes('does not exist') ? 'favorites 테이블이 없어요. supabase/schema.sql 을 실행했는지 확인해 주세요.' : err.message);
        else setRows(data || []);
        setLoading(false);
      });
  }, []);

  const toHit = (r) => ({ id: r.image_id, preview: r.preview_url, large: r.large_url, pageURL: r.page_url, tags: r.tags });

  const remove = async (hit) => {
    const { error: err } = await supabase.from('favorites').delete().eq('image_id', hit.id);
    if (!err) setRows((prev) => prev.filter((r) => r.image_id !== hit.id));
  };

  return (
    <section className="section">
      <h2>♥ {nickname}님의 제주 앨범</h2>
      {loading && <p className="center-note">불러오는 중…</p>}
      {error && <p className="center-note error">⚠️ {error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="center-note">
          아직 담은 사진이 없어요. <Link to="/gallery">갤러리</Link>에서 ♡ 를 눌러보세요!
        </p>
      )}
      <div className="grid">
        {rows.map((r) => (
          <ImageCard key={r.id} hit={toHit(r)} fav onFav={remove} onOpen={setOpen} />
        ))}
      </div>
      <Lightbox hit={open} onClose={() => setOpen(null)} />
    </section>
  );
}
