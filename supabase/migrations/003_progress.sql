create table if not exists progress (
  id text primary key,
  enrollment_id text not null,
  module_id text not null,
  completed boolean not null default false,
  test_score numeric,
  completed_at timestamptz,
  unique (enrollment_id, module_id)
);

create table if not exists outbox (
  id text primary key,
  to_email text not null,
  subject text not null,
  html text not null,
  created_at timestamptz not null default now(),
  status text not null check (status in ('demo', 'sent', 'failed')),
  dedupe_key text not null unique
);

alter table progress enable row level security;
alter table outbox enable row level security;
