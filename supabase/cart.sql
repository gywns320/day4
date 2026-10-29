-- 장바구니 기능용 테이블: Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다(이미 있으면 건너뛰거나 정책만 다시 만듭니다).

-- 1) 상품 테이블 ---------------------------------------------------------------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  name        text    not null,
  description text,
  price       integer not null check (price >= 0),      -- 원 단위
  emoji       text    not null default '🍊',            -- 사진이 없을 때 대신 보여줄 이모지
  image_query text,                                     -- Pixabay 검색어(영문)
  active      boolean not null default true,            -- false 면 판매 중지
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- 상품은 로그인하지 않아도 누구나 볼 수 있고, 수정은 대시보드(관리자)에서만 합니다.
drop policy if exists "상품은 누구나 조회" on public.products;
create policy "상품은 누구나 조회"
  on public.products for select to anon, authenticated
  using (active);

-- 2) 장바구니 테이블 -----------------------------------------------------------
create table if not exists public.cart_items (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  product_id  bigint not null references public.products (id) on delete cascade,
  quantity    integer not null default 1 check (quantity between 1 and 99),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)                          -- 같은 상품은 한 줄로 합쳐서 수량만 올림
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;

-- 내 장바구니만 보고, 담고, 수량 바꾸고, 지울 수 있게
drop policy if exists "내 장바구니 조회" on public.cart_items;
create policy "내 장바구니 조회"
  on public.cart_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "내 장바구니 담기" on public.cart_items;
create policy "내 장바구니 담기"
  on public.cart_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "내 장바구니 수정" on public.cart_items;
create policy "내 장바구니 수정"
  on public.cart_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "내 장바구니 삭제" on public.cart_items;
create policy "내 장바구니 삭제"
  on public.cart_items for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3) 샘플 상품 (products 가 비어 있을 때만 한 번 넣음) -----------------------------
insert into public.products (name, description, price, emoji, image_query)
select * from (values
  ('한라봉 선물세트 3kg',   '껍질이 얇고 과즙이 가득한 제주 한라봉. 선물용으로 인기!', 28000, '🍊', 'hallabong mandarin'),
  ('제주 감귤 5kg',         '새콤달콤 노지 감귤. 겨울 간식으로 딱이에요.',               15000, '🍊', 'jeju tangerine'),
  ('천혜향 2kg',            '향이 진하고 달콤한 천혜향.',                                 24000, '🍑', 'orange fruit basket'),
  ('오메기떡 10개입',       '쫀득한 제주 전통 떡. 팥고물이 듬뿍.',                         18000, '🍡', 'mochi rice cake'),
  ('감귤 초콜릿',           '감귤 향이 퍼지는 달콤한 초콜릿.',                              9000, '🍫', 'chocolate orange'),
  ('제주 녹차 티백 20입',   '청정 제주에서 자란 향긋한 녹차.',                             14000, '🍵', 'green tea'),
  ('흑돼지 오겹살 500g',    '쫄깃하고 고소한 제주 흑돼지.',                                22000, '🥓', 'pork belly grilled'),
  ('돌하르방 미니어처',     '책상 위에서 지켜주는 작은 돌하르방.',                         12000, '🗿', 'stone statue figurine')
) as v(name, description, price, emoji, image_query)
where not exists (select 1 from public.products);
