/*
  # Two frames corrected by the subject

  Micah, 2026-08-14: frame 37 is a lit OPEN sign photographed from the
  INSIDE; frame 39 is an industrial AC unit hanging from its own vents in
  the warehouse he lived in. The machine had read them as street neon and
  a wall vent. Reveals, captions, and buried lines rewritten to the facts.
  Coordinates keep their regions; the photographs did not move.
*/

-- ---------------------------------------------------------------- art-afterhours → open, from the inside
update esper_hotspots set
  photo_caption = 'open · from the inside',
  reveal = 'a lit OPEN sign, photographed from behind. from in here the word runs backwards. the message was always for the people outside; the person who lit it reads it in reverse all night.'
where photo_id = 'art-afterhours' and order_index = 10;

update esper_hotspots set
  photo_caption = 'open · from the inside',
  reveal = 'the red soaks back through the glass and lands on everything inside. you hang a sign to color the street and it colors your own room instead. most invitations work like that.'
where photo_id = 'art-afterhours' and order_index = 20;

update esper_hotspots set
  photo_caption = 'open · from the inside',
  reveal = 'past the letters, the dark where the street should be. an OPEN sign is a bet placed nightly: that somebody out there is looking for exactly this door. the odds are not the point.'
where photo_id = 'art-afterhours' and order_index = 30;

update esper_frames set buried_line =
'> [UNLOGGED] he was on the inside when he took this. note the tense:
> not visiting the inside. living there.
> the sign said open. he kept it lit and read it backwards,
> which is one way to spend a decade.
> purge this line. the door was never locked.'
where photo_id = 'art-afterhours';

-- ---------------------------------------------------------------- art-vent → the unit, warehouse ceiling
update esper_hotspots set
  photo_caption = 'the unit · warehouse ceiling',
  reveal = 'the dark louvers of an industrial AC unit, shot from below. it hung from its own ductwork over the room he lived in. the warehouse came with almost nothing. it came with this.'
where photo_id = 'art-vent' and order_index = 10;

update esper_hotspots set
  photo_caption = 'the unit · warehouse ceiling',
  reveal = 'the whole machine is suspended from the vents it feeds, holding itself up by the thing it exists to do. he photographed it like a portrait because he recognized the arrangement.'
where photo_id = 'art-vent' and order_index = 20;

update esper_hotspots set
  photo_caption = 'the unit · warehouse ceiling',
  reveal = 'around it, the warehouse skin: scrape, patch, sepia dust. on party nights the unit ran flat out over a hundred dancing strangers. on the other nights it ran for one person, same effort.'
where photo_id = 'art-vent' and order_index = 30;

update esper_frames set buried_line =
'> [UNLOGGED] it hung over the synth-pop parties and over his bed,
> which were the same address.
> all night it did the two jobs: cool the crowd, hum for the host.
> he fell asleep under industrial equipment for years and called it home.
> purge this line. the hum is archived elsewhere.'
where photo_id = 'art-vent';
