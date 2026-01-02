-- Create table for Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id bigint generated always as identity primary key,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to subscribe (Insert)
CREATE POLICY "Allow public insert to push_subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow only admin/service_role to select (for sending notifications)
-- Assuming 'service_role' key bypasses RLS, but explicit policy for authenticated admins (if using auth) is good.
-- However, typically backend uses service_role which bypasses RLS.
-- If we want to allow an admin user logged in via Frontend to see them? The prompt says "SELECT solo para Admin/Service Role".
-- Let's stick strictly to Service Role (which bypasses) and maybe authenticated users if needed later. 
-- But prompt says "SELECT solo para Admin/Service Role".
-- We can add a policy for authenticated users, but really we don't want just ANY auth user to see all subscriptions.
-- Let's just create a policy that effectively disables SELECT for anonymous users.
-- Actually, if we don't create a FOR SELECT policy, it defaults to deny for everyone (except service_role).
-- So by doing nothing for SELECT, we achieve "Restricted".
-- But to be explicit and perhaps allow a specific admin check if needed (though Supabase usually handles ad-hoc admin logic differently).
-- We'll rely on default-deny for SELECT (Service Role bypasses everything).
