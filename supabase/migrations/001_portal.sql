-- EFI student portal. Apply with the Supabase CLI or the SQL editor.
-- The app uses the service role on the server. Row level security stays on
-- and anonymous clients have no policies.

create table if not exists batches (
  id text primary key,
  course_slug text not null,
  name text not null,
  days text not null,
  time text not null,
  start_date date not null,
  end_date date not null,
  seats int not null
);

create table if not exists users (
  id text primary key,
  role text not null check (role in ('student', 'staff')),
  full_name text not null,
  email text not null unique,
  phone text not null default '',
  cnic text not null default '',
  roll_number text unique,
  batch_id text references batches (id),
  qr_token text unique,
  onboarded boolean not null default false,
  password_hash text,
  shopify_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  course_slug text not null,
  batch_id text not null references batches (id),
  status text not null check (status in ('invited', 'active', 'completed', 'withdrawn')),
  shopify_order_id text,
  enrolled_at timestamptz not null default now()
);

create table if not exists passkeys (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  device_name text not null default 'Passkey',
  created_at timestamptz not null default now()
);

create table if not exists otps (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed boolean not null default false
);

create table if not exists challenges (
  id text primary key,
  kind text not null check (kind in ('register', 'login')),
  user_id text,
  challenge text not null,
  expires_at timestamptz not null
);

alter table batches enable row level security;
alter table users enable row level security;
alter table enrollments enable row level security;
alter table passkeys enable row level security;
alter table otps enable row level security;
alter table challenges enable row level security;
