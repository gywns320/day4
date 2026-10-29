import { useEffect, useState } from 'react';
import { searchImages } from '../lib/images.js';

// Pixabay 사진을 보여주고, 키가 없거나 결과가 없으면 상품 이모지로 대신합니다.
export default function ProductImage({ product, className = 'product-img' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let alive = true;
    if (!product.image_query) return undefined;
    searchImages(product.image_query, 3)
      .then((hits) => alive && hits[0] && setSrc(hits[0].preview))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [product.image_query]);

  return (
    <div className={className} style={src ? { backgroundImage: `url(${src})` } : undefined} role="img" aria-label={product.name}>
      {!src && <span className="emoji">{product.emoji}</span>}
    </div>
  );
}
