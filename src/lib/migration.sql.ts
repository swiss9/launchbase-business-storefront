export const MIGRATION_SQL = `
create extension if not exists "uuid-ossp";

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.admin_users disable row level security;

create table if not exists public.site_settings (
  id int primary key default 1,
  name text not null default 'Your Business Name',
  tagline text default '',
  logo text default '',
  favicon text default '/favicon.ico',
  colors jsonb default '{"primary":"#111","primaryLight":"#333","secondary":"#fafafa","dark":"#111","light":"#fafafa"}',
  fonts jsonb default '{"heading":"Cinzel, serif","body":"Inter, sans-serif"}',
  hero jsonb default '{}',
  about jsonb default '{}',
  contact jsonb default '{}',
  footer jsonb default '{"copyright":"","socials":{"instagram":"","facebook":"","x":"","youtube":"","whatsapp_channel":"","telegram_channel":"","discord_channel":"","viber_channel":""}}',
  nav jsonb default '[]',
  chat jsonb default '{"whatsapp":"","telegram":"","discord":"","viber":""}',
  preferred_chat text default 'whatsapp',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public read" on public.site_settings;
create policy "Public read" on public.site_settings for select using (true);

drop policy if exists "Admin insert" on public.site_settings;
create policy "Admin insert" on public.site_settings for insert with check (auth.uid() in (select user_id from public.admin_users));

drop policy if exists "Admin update" on public.site_settings;
create policy "Admin update" on public.site_settings for update using (auth.uid() in (select user_id from public.admin_users)) with check (auth.uid() in (select user_id from public.admin_users));

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image text default '',
  images jsonb default '[]',
  badge text,
  icon text default 'sparkles',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

drop policy if exists "Public read" on public.products;
create policy "Public read" on public.products for select using (is_active = true);

drop policy if exists "Admin manage" on public.products;
create policy "Admin manage" on public.products for all using (auth.uid() in (select user_id from public.admin_users));

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  product_id uuid references public.products(id),
  quantity int default 1,
  total_price numeric(10,2) not null,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "Admin read" on public.orders;
create policy "Admin read" on public.orders for select using (auth.uid() in (select user_id from public.admin_users));

drop policy if exists "Public insert" on public.orders;
create policy "Public insert" on public.orders for insert with check (true);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  user_id uuid references auth.users(id),
  author text,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  approved boolean default false,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Public read approved" on public.reviews;
create policy "Public read approved" on public.reviews for select using (approved = true);

drop policy if exists "Public insert" on public.reviews;
create policy "Public insert" on public.reviews for insert with check (true);

drop policy if exists "Admin delete" on public.reviews;
create policy "Admin delete" on public.reviews for delete using (auth.uid() in (select user_id from public.admin_users));

drop policy if exists "Admin update" on public.reviews;
create policy "Admin update" on public.reviews for update using (auth.uid() in (select user_id from public.admin_users));

-- Allow admins to see all reviews (including unapproved)
drop policy if exists "Admin read all" on public.reviews;
create policy "Admin read all" on public.reviews
  for select
  using (auth.uid() in (select user_id from public.admin_users));

-- Seed default site settings
insert into public.site_settings (id, name) values (1, 'Your Business Name') on conflict (id) do nothing;

-- First user becomes admin
create or replace function public.make_first_user_admin()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.admin_users) then
    insert into public.admin_users (user_id, created_at)
    values (new.id, now());
  end if;
  return new;
end;
$$;

drop trigger if exists on_first_user_admin on auth.users;
create trigger on_first_user_admin
  after insert on auth.users
  for each row execute function public.make_first_user_admin();
`;
