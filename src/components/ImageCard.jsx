export default function ImageCard({ hit, fav, onFav, onOpen }) {
  return (
    <figure className="card">
      <img src={hit.preview} alt={hit.tags} loading="lazy" onClick={() => onOpen(hit)} />
      <button
        className={`heart ${fav ? 'on' : ''}`}
        aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        onClick={() => onFav(hit)}
      >
        {fav ? '♥' : '♡'}
      </button>
      <figcaption>{hit.tags}</figcaption>
    </figure>
  );
}
