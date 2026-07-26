/*
  # Esper — correct the photographer credit, and let the data carry the frame

  ## 1. The credit

  20260706130000_esper_real_frames_no_credit.sql claimed "@micahboswell" was a
  fictional credit, substituted "@greyharbor7" in its header and in the component
  comment, and blanked photo_credit on the five frames it added. @micahboswell is
  his real handle — 104 photographs, profile linking back to conscious-shell.com,
  corroborated by his author bio in the vault and by
  supabase/migrations/20260422102044_create_web_dossier.sql. Restoring one
  consistent credit across every row so the column stops carrying two stories.

  ## 2. The caption

  Eight rows carry a trailing " · m. boswell" byline; five do not. Once the
  component derives its frames from this table the mismatch is visible on screen,
  so the byline comes off the caption and lives in photo_credit where it belongs.
  Captions all read `case file #2049 · <subject>`. The reveal prose is untouched.

  ## 3. Two new columns

  - `photo_pos` — object-position for the portrait frames the 16:10 crop would
    otherwise behead. These values were hardcoded in EsperScene.tsx; they belong
    with the frame.
  - `photo_order` — explicit frame sequence. `order by order_index` alone ties on
    every 10/20/30, so first-appearance frame order was left to whatever the heap
    handed back. Now the sequence is an UPDATE, not a coin flip.
*/

-- 1. one credit ---------------------------------------------------------------
update esper_hotspots
set photo_credit = 'photo · micah boswell / unsplash · @micahboswell'
where coalesce(photo_credit, '') = ''
   or photo_credit ilike '%greyharbor%'
   or photo_credit is distinct from 'photo · micah boswell / unsplash · @micahboswell';

-- 2. one caption register -----------------------------------------------------
update esper_hotspots
set photo_caption = regexp_replace(photo_caption, '\s*·\s*m\. boswell\s*$', '')
where photo_caption ~ '·\s*m\. boswell\s*$';

-- 3. frame metadata -----------------------------------------------------------
alter table esper_hotspots add column if not exists photo_pos text;
alter table esper_hotspots add column if not exists photo_order integer;

-- object-position for the portrait frames, lifted out of the component.
update esper_hotspots set photo_pos = '50% 34%' where photo_id = 'photo-1603324905312-0f8fe8117cd8';
update esper_hotspots set photo_pos = '50% 42%' where photo_id = 'photo-1665697724166-5d6bfd0cdcbd';
update esper_hotspots set photo_pos = '50% 45%' where photo_id = 'photo-1660260964885-528df60aa658';

-- Frame sequence. The first nine preserve the order of the hardcoded PHOTOS
-- array they are replacing; the four that were stranded in this table and never
-- reachable from the client follow. Re-sequencing is one UPDATE from here.
update esper_hotspots set photo_order = 10  where photo_id = 'photo-1666554757112-91093a627335'; -- elevator reflection
update esper_hotspots set photo_order = 20  where photo_id = 'photo-1601743240194-f45724587958'; -- blue light streaks
update esper_hotspots set photo_order = 30  where photo_id = 'photo-1608688107623-c5e228d8df63'; -- green stone fragment
update esper_hotspots set photo_order = 40  where photo_id = 'photo-1601742891608-9c1577b3a4b3'; -- red and brown ceiling
update esper_hotspots set photo_order = 50  where photo_id = 'photo-1603324905312-0f8fe8117cd8'; -- el capitolio, after dark
update esper_hotspots set photo_order = 60  where photo_id = 'photo-1676505073681-82b680b71725'; -- the road into fog
update esper_hotspots set photo_order = 70  where photo_id = 'photo-1665697724166-5d6bfd0cdcbd'; -- two chairs, unoccupied
update esper_hotspots set photo_order = 80  where photo_id = 'photo-1660258785270-45fa53c00e81'; -- one bloom, three buds
update esper_hotspots set photo_order = 90  where photo_id = 'photo-1660260964885-528df60aa658'; -- a single filament over dark water
update esper_hotspots set photo_order = 100 where photo_id = 'photo-1542768581-0ddb91c116ef';    -- pendant light      (recovered)
update esper_hotspots set photo_order = 110 where photo_id = 'photo-1560946352-188f23e76712';    -- green and brown leaf (recovered)
update esper_hotspots set photo_order = 120 where photo_id = 'photo-1542484183-17a107e68edf';    -- blue wooden door   (recovered)
update esper_hotspots set photo_order = 130 where photo_id = 'photo-1559313240-d9398a1ce018';    -- white and blue building (recovered)
