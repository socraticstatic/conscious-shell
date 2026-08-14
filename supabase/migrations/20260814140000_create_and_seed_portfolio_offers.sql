/*
  # portfolio_offers — the two productized engagements

  Backs the offers block rendered above the capabilities list in the
  services section. portfolio_services stays as the capabilities rail;
  offers are a distinct shape (scope, deliverables, price, availability)
  and a distinct sales object, so they get their own table rather than
  columns bolted onto services.

  Public read; no client writes. Seeded with the two-offer ladder decided
  2026-08-14 (vault: 💼 Consulting/Practice_Strategy.md): a fixed-fee
  teardown as the door-opener, an advisory retainer behind it.
*/

create table if not exists public.portfolio_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  deliverables text[] not null default '{}',
  duration text not null default '',
  price_label text not null default '',
  availability text not null default '',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.portfolio_offers enable row level security;
drop policy if exists "Anyone can read offers" on public.portfolio_offers;
create policy "Anyone can read offers" on public.portfolio_offers
  for select to public using (true);

insert into public.portfolio_offers
  (slug, name, tagline, description, deliverables, duration, price_label, availability, order_index)
values
  (
    'ai-adoption-teardown',
    'AI Adoption Teardown',
    'Your pilot works. Nobody uses it.',
    'Two weeks inside a stalled AI pilot to find out why the humans are not adopting it. Most pilots fail on interaction design and workflow fit, not on the model. I map where people drop off, redesign the interaction model, and hand your engineering team a path they can build.',
    array[
      'Workflow audit and user interviews',
      'Failure map: where and why people drop off',
      'Redesigned interaction model',
      'Implementation path for your engineering team'
    ],
    '2 weeks, fixed scope',
    '$18,000 fixed',
    'One engagement per month',
    0
  ),
  (
    'advisory-retainer',
    'Advisory Retainer',
    'Design direction for teams shipping AI without a design leader.',
    'Ongoing advisory for teams building AI products. Roadmap direction, review of agent UX before it ships, and mentoring for the designers and engineers doing the work. Usually follows a teardown.',
    array[
      'Design direction on the AI roadmap',
      'Agent UX review before ship',
      'Team mentoring, async + one standing call'
    ],
    '4-6 hrs/week, 3-month minimum',
    '$6,000/month',
    'Two concurrent, selective',
    1
  );
