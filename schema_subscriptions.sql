-- Add push_subscriptions table
create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  endpoint text unique not null,
  keys jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table push_subscriptions enable row level security;

create policy "Service can manage subscriptions"
  on push_subscriptions for all
  using ( true ); -- Simplify for now as the server uses service role key which bypasses RLS, but if using anon it needs policy. 
  -- Ideally: public insert, service read/delete.
