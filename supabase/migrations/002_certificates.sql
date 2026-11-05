create table if not exists certificates (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  enrollment_id text,
  roll_number text not null unique,
  student_name text not null,
  course_name text not null,
  issued_at timestamptz not null,
  serial text not null unique
);

alter table certificates enable row level security;
