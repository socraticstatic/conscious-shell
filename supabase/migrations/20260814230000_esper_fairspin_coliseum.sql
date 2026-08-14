/*
  # Fair Park · The Spin, corrected by the subject

  Micah, 2026-08-14: the frame shows a small coliseum at Fair Park — the
  bands the machine read as motion blur are curved pillars and their
  shadows. The title stays; the spin belongs to the building.
*/

update esper_hotspots set
  reveal = 'a small coliseum at fair park, its wall coming around to meet itself. nothing in the photograph is moving. the building does the spinning, one pillar at a time, and lets the visitors hold still.'
where photo_id = 'art-fairspin' and order_index = 10;

update esper_hotspots set
  reveal = 'a pillar catching the sun full-on while its neighbors wait in line. curved architecture meters out the light like that: every column gets its hour, none of them get the day.'
where photo_id = 'art-fairspin' and order_index = 20;

update esper_hotspots set
  reveal = 'the pink is plaster in texas light, poster-flattened until the wall and its shadow are just two opinions about the same curve. deco architecture was optimism you could walk around. fair park kept a whole yard of it.'
where photo_id = 'art-fairspin' and order_index = 30;

update esper_frames set buried_line =
'> [UNLOGGED] he shot a building built to hold a crowd, on a day it held
> nobody, and framed the curve so tight it reads as motion.
> stillness photographed honestly looks like spinning.
> he knew that from the inside.
> purge this line. the pillars are still taking turns.'
where photo_id = 'art-fairspin';
