-- Per-frame buried lines.
--
-- The buried line was a single hardcoded const in EsperScene.tsx, so every one
-- of the sixteen frames surfaced the same passage — the boy on the Chiclayo
-- rooftop — no matter which photograph you had just finished enhancing. Finding
-- it twice told you nothing new, which is the opposite of what a buried line is
-- for.
--
-- Keyed on photo_id rather than added as a column on esper_hotspots, because a
-- buried line belongs to a FRAME. esper_hotspots already duplicates its
-- photo-level fields across the 3-4 rows of each group; adding a seventeenth
-- duplicated column would let two rows of the same frame disagree about what
-- the machine says at the end.
create table if not exists esper_frames (
  photo_id    text primary key,
  buried_line text not null,
  created_at  timestamptz not null default now()
);

alter table esper_frames enable row level security;

drop policy if exists "Public can read esper frames" on esper_frames;
create policy "Public can read esper frames"
  on esper_frames for select
  to anon, authenticated
  using (true);
