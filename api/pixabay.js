// Vercel 서버리스 함수: Pixabay API 키를 브라우저에 노출하지 않고 이미지를 검색해 줍니다.
// GET /api/pixabay?q=jeju+island&n=12
export default async function handler(req, res) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았어요.' });
  }

  const q = String(req.query.q || 'jeju island').slice(0, 100);
  const n = Math.min(Math.max(parseInt(req.query.n, 10) || 12, 3), 60);

  const url = new URL('https://pixabay.com/api/');
  url.search = new URLSearchParams({
    key,
    q,
    lang: 'en',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: String(n),
  }).toString();

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: `Pixabay 응답 오류 (${r.status})` });
    const data = await r.json();
    const hits = (data.hits || []).map((h) => ({
      id: h.id,
      tags: h.tags,
      pageURL: h.pageURL,
      preview: h.webformatURL,
      large: h.largeImageURL,
      user: h.user,
    }));
    // 같은 검색은 하루 동안 CDN에서 재사용 → Pixabay 호출 횟수 절약
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json({ hits });
  } catch (e) {
    return res.status(502).json({ error: '이미지를 불러오지 못했어요.' });
  }
}
