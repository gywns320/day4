# 🍊 놀멍쉬멍 제주

제주 사진 갤러리 + Supabase 회원가입/로그인 + 즐겨찾기 사이트. (Vite + React, Vercel 배포)

- 사진: [Pixabay API](https://pixabay.com/api/docs/) — 키는 서버리스 함수(`api/pixabay.js`)에서만 사용
- 인증/DB: Supabase (이메일+비밀번호, `favorites` 테이블 + RLS)

---

## 0. 준비물

| 도구 | 설치 확인 |
|---|---|
| Node.js 18 이상 (LTS 권장) — https://nodejs.org | `node -v` |
| Git | `git --version` |
| GitHub, Vercel, Supabase, Pixabay 계정 | 모두 무료 플랜 OK |

## 1. Supabase 설정

1. 대시보드에서 프로젝트를 엽니다.
2. **Project Settings → API Keys** (또는 상단 `Connect` 버튼)에서 두 값을 복사해 둡니다.
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** 키 (새 UI에서는 *Publishable key*) → `VITE_SUPABASE_ANON_KEY`
   - ⚠️ `service_role` / *secret* 키는 절대 사용하거나 올리지 마세요.
3. **Authentication → Sign In / Providers → Email** 이 켜져 있는지 확인합니다.
   - 개발 중 편하게 테스트하려면 *Confirm email* 을 끄면 가입 즉시 로그인됩니다. (운영에서는 켜두는 걸 권장)
4. **SQL Editor → New query** 에 [`supabase/schema.sql`](supabase/schema.sql) 내용을 붙여넣고 **Run** → `favorites` 테이블이 생성됩니다.
5. **Authentication → URL Configuration** 은 배포 후(6단계 뒤) 설정합니다.

## 2. Pixabay API 키

1. https://pixabay.com 에 가입/로그인합니다.
2. https://pixabay.com/api/docs/ 문서 페이지에 로그인된 상태로 들어가면 **본인 API 키**가 표시됩니다. → `PIXABAY_API_KEY`
3. 사진 사용 시 Pixabay 출처 표기를 유지해 주세요(푸터에 이미 있음). 키는 무료이고 분당 호출 제한이 있어 서버에서 하루 캐시합니다.

## 3. 로컬 실행

```bash
npm install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
# .env 파일을 열어 세 값을 채웁니다
npm run dev              # http://localhost:5173
```

`.env` 내용:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon public)
PIXABAY_API_KEY=xxxxxxxx
```

로컬에서도 `/api/pixabay` 가 동일하게 동작하도록 `vite.config.js` 에 개발용 플러그인이 들어 있습니다.

## 4. GitHub에 올리기

1. https://github.com/new 에서 빈 저장소를 만듭니다. (README/.gitignore 추가 체크 해제)
2. 아래 명령 실행 (저장소 주소는 본인 것으로):

```bash
git remote add origin https://github.com/<내아이디>/<저장소이름>.git
git branch -M main
git push -u origin main
```

`.env` 는 `.gitignore` 에 있어 올라가지 않습니다. 키가 들어간 파일을 커밋하지 마세요.

## 5. Vercel 배포 + 환경변수 등록

1. https://vercel.com/new → **Import Git Repository** 에서 위 저장소 선택.
2. Framework Preset 이 **Vite** 로 자동 인식됩니다. (Build: `npm run build`, Output: `dist`)
3. **Environment Variables** 에 아래 3개를 추가합니다. (Production / Preview / Development 모두 체크)

| Name | Value | 비고 |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL | 브라우저에 노출돼도 됨 |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public 키 | RLS로 보호됨 |
| `PIXABAY_API_KEY` | Pixabay 키 | `VITE_` 없음 → 서버 전용 |

4. **Deploy** 클릭. 완료되면 `https://<프로젝트>.vercel.app` 주소가 생깁니다.
5. 환경변수를 바꾼 뒤에는 **Deployments → ⋯ → Redeploy** 해야 반영됩니다. (`VITE_*` 는 빌드 시점에 코드에 박힙니다)

## 6. 배포 주소를 Supabase에 알려주기 (중요)

**Supabase → Authentication → URL Configuration**

- **Site URL**: `https://<프로젝트>.vercel.app`
- **Redirect URLs** 에 추가:
  - `https://<프로젝트>.vercel.app/**`
  - `http://localhost:5173/**` (로컬 테스트용)

이걸 안 하면 이메일 인증 링크가 `localhost` 로 연결됩니다.

## 7. 동작 확인 체크리스트

- [ ] 홈에서 명소 사진 6장이 보인다 (안 보이면 `PIXABAY_API_KEY` 확인)
- [ ] 회원가입 → (인증 메일 확인) → 로그인 → 헤더에 `○○님` 표시
- [ ] 갤러리에서 ♡ 클릭 → `내 즐겨찾기` 에 표시, 새로고침해도 유지
- [ ] 로그아웃 후 `/favorites` 접근 시 로그인 화면으로 이동

## 폴더 구조

```
api/pixabay.js        Vercel 서버리스 함수 (Pixabay 키 보호 + 캐시)
supabase/schema.sql   favorites 테이블 + RLS 정책
src/lib/              supabase 클라이언트, 인증 컨텍스트, 이미지 검색, 즐겨찾기 훅
src/pages/            Home, Gallery, Favorites, Login, Signup
vercel.json           SPA 새로고침 시 404 방지 rewrite
```
