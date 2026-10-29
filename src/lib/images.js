const memory = new Map();

// Pixabay 이미지 검색 (서버리스 함수 /api/pixabay 경유). 같은 검색은 메모리·sessionStorage에 캐시합니다.
export async function searchImages(q, n = 12) {
  const key = `pix:${q}|${n}`;
  if (memory.has(key)) return memory.get(key);
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const hits = JSON.parse(saved);
      memory.set(key, hits);
      return hits;
    }
  } catch {
    /* sessionStorage 사용 불가 시 무시 */
  }

  const res = await fetch(`/api/pixabay?${new URLSearchParams({ q, n })}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '이미지를 불러오지 못했어요.');
  }
  const { hits } = await res.json();
  memory.set(key, hits);
  try {
    sessionStorage.setItem(key, JSON.stringify(hits));
  } catch {
    /* 무시 */
  }
  return hits;
}
