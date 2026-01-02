-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type dish_category as enum ('entrante', 'principal', 'postre', 'racion', 'bebida');

-- 2. TABLES

-- Dishes Table
create table dishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  category dish_category not null,
  photo_url text,
  allergens text[] default '{}',
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily Menus Table
create table daily_menus (
  id uuid primary key default uuid_generate_v4(),
  date date unique not null,
  price decimal(10, 2) not null,
  active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Many-to-Many: Daily Menus <-> Dishes
create table daily_menu_items (
  menu_id uuid references daily_menus(id) on delete cascade not null,
  dish_id uuid references dishes(id) on delete cascade not null,
  primary key (menu_id, dish_id)
);

-- Notifications Table
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  sent_at timestamp with time zone,
  segment text default 'all',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS POLICIES
alter table dishes enable row level security;
alter table daily_menus enable row level security;
alter table daily_menu_items enable row level security;
alter table notifications enable row level security;

-- Policy helper: Public Read, Authenticated Write

-- Dishes
create policy "Public dishes are viewable by everyone"
  on dishes for select using ( true );

create policy "Authenticated users can insert dishes"
  on dishes for insert with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update dishes"
  on dishes for update using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete dishes"
  on dishes for delete using ( auth.role() = 'authenticated' );

-- Daily Menus
create policy "Public menus are viewable by everyone"
  on daily_menus for select using ( true );

create policy "Authenticated users can manage menus"
  on daily_menus for all using ( auth.role() = 'authenticated' );

-- Daily Menu Items
create policy "Public menu items are viewable by everyone"
  on daily_menu_items for select using ( true );

create policy "Authenticated users can manage menu items"
  on daily_menu_items for all using ( auth.role() = 'authenticated' );

-- Notifications
create policy "Public notifications are viewable by everyone"
  on notifications for select using ( true );

create policy "Authenticated users can manage notifications"
  on notifications for all using ( auth.role() = 'authenticated' );

-- 4. STORAGE (Commented out, requires Storage enabled in Supabase Dashboard)
-- insert into storage.buckets (id, name, public) values ('dishes', 'dishes', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'dishes' );
-- create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'dishes' and auth.role() = 'authenticated' );
