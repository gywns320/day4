import { useEffect } from 'react';

export default function Lightbox({ hit, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!hit) return null;
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
        <img src={hit.large || hit.preview} alt={hit.tags} />
        <p>
          {hit.tags}
          {hit.user && <> · 사진: {hit.user} / </>}
          {hit.pageURL && (
            <a href={hit.pageURL} target="_blank" rel="noreferrer">Pixabay에서 보기</a>
          )}
        </p>
        <button className="btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
