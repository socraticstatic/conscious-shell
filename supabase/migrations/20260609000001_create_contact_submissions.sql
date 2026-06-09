create table if not exists contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now()
);

alter table contact_submissions enable row level security;

create policy "allow anon insert"
  on contact_submissions
  for insert
  to anon
  with check (true);
