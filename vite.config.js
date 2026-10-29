import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import pixabayHandler from './api/pixabay.js';

// 로컬 개발(npm run dev)에서도 Vercel 서버리스 함수(/api/pixabay)와 똑같이 동작하게 해주는 플러그인
function pixabayDevApi(env) {
  return {
    name: 'pixabay-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/pixabay', async (req, res) => {
        process.env.PIXABAY_API_KEY = env.PIXABAY_API_KEY || '';
        const url = new URL(req.url, 'http://localhost');
        req.query = Object.fromEntries(url.searchParams);
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(obj));
        };
        try {
          await pixabayHandler(req, res);
        } catch (e) {
          res.status(500).json({ error: String(e.message || e) });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // VITE_ 접두사 없는 변수(PIXABAY_API_KEY)도 읽음
  return {
    plugins: [react(), pixabayDevApi(env)],
  };
});
