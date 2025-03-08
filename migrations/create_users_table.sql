-- Create a "users" table to store additional user data
create table public.users (
  id uuid primary key,
  email text not null,
  username text,
  created_at timestamptz default now()
);
