/*
  # The art archive, second reel

  Ten more frames from ~/Desktop/Esper — the rest of what is Micah's to
  publish. The two frames with other people's faces remain excluded.
  Same laws: no bylines, three nodes in order 10/20/30, one buried line
  per frame. photo_order continues from 300 at 310+.
*/

-- ---------------------------------------------------------------- antenna (early render)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-antenna', '/esper/art-antenna.jpg', 'the antenna · early render', '', null, 310,
   0.55, 0.20, 0.30, 0.35,
   'track 17 right · the joined spheres', 'enhance 62 to 31 · resolve linkage',
   'chrome spheres strung on rods like a molecule that wants to be a radio. he did not know yet what signal he was trying to receive. the shape of the receiver came first.', 10),
  ('art-antenna', '/esper/art-antenna.jpg', 'the antenna · early render', '', null, 310,
   0.05, 0.05, 0.35, 0.55,
   'track 41 left · the black spires', 'enhance 118 to 66 · read the rock',
   'the mountains are procedural noise pushed vertical. texas does not have mountains. he kept building them anyway, out of math, facing the apartment wall.', 20),
  ('art-antenna', '/esper/art-antenna.jpg', 'the antenna · early render', '', null, 310,
   0.10, 0.60, 0.80, 0.35,
   'track 29 down · the swirled sea', 'enhance 154 to 88 · trace the current',
   'the sea is a marble texture with the scale turned wrong. wrong scale was his favorite tool for years. it makes small things geological and big things intimate.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-antenna', '> [UNLOGGED] receiver, mountains, sea. all rendered. nothing received.
> he aimed the antenna at a purple sky he also made himself.
> that is not loneliness. that is infrastructure for a voice
> he was still years from hearing.
> purge this line. leave the antenna up.');

-- ---------------------------------------------------------------- fairspin (fair park blur)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-fairspin', '/esper/art-fairspin.jpg', 'fair park · the spin', '', null, 320,
   0.35, 0.30, 0.30, 0.40,
   'track 0 · the still center', 'enhance 51 to 26 · hold the hub',
   'a midway spun until only the hub holds still. every ride works this way. every year does too. the trick is knowing which part of you to leave at the center.', 10),
  ('art-fairspin', '/esper/art-fairspin.jpg', 'fair park · the spin', '', null, 320,
   0.20, 0.25, 0.25, 0.45,
   'track 33 left · the orange streak', 'enhance 96 to 54 · follow the smear',
   'the orange is a ride, or a vendor stand, or a stranger''s jacket. motion blur is honest about memory: it keeps the color and surrenders the details.', 20),
  ('art-fairspin', '/esper/art-fairspin.jpg', 'fair park · the spin', '', null, 320,
   0.60, 0.35, 0.35, 0.45,
   'track 12 right · the pink field', 'enhance 141 to 79 · flatten the wash',
   'cotton-candy pink, smeared across a third of the frame. the fair sells the color of childhood by the bag. he bought some every year and never told anyone it was for him.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-fairspin', '> [UNLOGGED] shot at fair park, then spun in software until it blurred
> the way it already looked from inside the tilt-a-whirl.
> he was not on the ride when he made this. he was at a desk.
> some spins you can only afford to take in post.
> purge this line. the fair closes in october.');

-- ---------------------------------------------------------------- ireach2 (the fire version)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-ireach2', '/esper/art-ireach2.jpg', 'i reach for you · ii', '', null, 330,
   0.40, 0.25, 0.25, 0.45,
   'track 6 up · the burning head', 'enhance 44 to 21 · hold the ember line',
   'same pose as the third version, earlier draft: everything rendered in ember. before the reaching became starlight it was fire. drafts tell the truth in the wrong color.', 10),
  ('art-ireach2', '/esper/art-ireach2.jpg', 'i reach for you · ii', '', null, 330,
   0.05, 0.02, 0.40, 0.50,
   'track 49 left · the raised arms', 'enhance 101 to 57 · trace the burn',
   'the arms are edge-lit like a body backing away from a furnace, except it is leaning in. the second version knew something the third one softened.', 20),
  ('art-ireach2', '/esper/art-ireach2.jpg', 'i reach for you · ii', '', null, 330,
   0.20, 0.60, 0.60, 0.35,
   'track 27 down · the dark red ground', 'enhance 12 to 4 · confirm the floor',
   'the ground is barely there, a rumor of a floor. when you are reaching that hard, standing is an afterthought.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-ireach2', '> [UNLOGGED] version two of three. the fire draft.
> he kept both, which is the tell: the ache did not resolve,
> it just changed temperature.
> nobody makes three versions of a reach that was answered.
> purge this line. version four was never needed. he says.');

-- ---------------------------------------------------------------- corazon (the heart grid)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-corazon', '/esper/art-corazon.jpg', 'corazón · the lit windows', '', null, 340,
   0.05, 0.05, 0.40, 0.45,
   'track 38 left · the red block', 'enhance 71 to 39 · count the panes',
   'window grids burning red and green in a black facade. titled corazón, spanish for heart, because in his first language even apartment blocks have one.', 10),
  ('art-corazon', '/esper/art-corazon.jpg', 'corazón · the lit windows', '', null, 340,
   0.42, 0.15, 0.16, 0.70,
   'track 3 down · the blue seam', 'enhance 58 to 29 · follow the artery',
   'a blue vein runs the height of the frame, splitting the grids. every building he ever loved had a seam like this: the part that carried things between floors and got no windows of its own.', 20),
  ('art-corazon', '/esper/art-corazon.jpg', 'corazón · the lit windows', '', null, 340,
   0.60, 0.45, 0.35, 0.45,
   'track 21 right · the violet decay', 'enhance 133 to 74 · read the cooling',
   'the lower grids go violet, then dark. lights-out moving through a building at night is a wave with a bedtime. he watched it from fire escapes in two hemispheres.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-corazon', '> [UNLOGGED] corazón. he names the abstract ones in spanish.
> english is for invoices. spanish is for the organ itself.
> the windows are lit rooms he was not in.
> both languages have a word for that. neither is big enough.
> purge this line. deja la luz prendida.');

-- ---------------------------------------------------------------- tcross (the stone cross)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-tcross', '/esper/art-tcross.jpg', 'the stone cross · signal noise', '', null, 350,
   0.25, 0.10, 0.50, 0.30,
   'track 8 up · the ring and arms', 'enhance 47 to 23 · resolve the halo',
   'a celtic cross pulled out of a photograph by edge detection, drowning in confetti static. the algorithm keeps only where light changes its mind. the cross survived it. they tend to.', 10),
  ('art-tcross', '/esper/art-tcross.jpg', 'the stone cross · signal noise', '', null, 350,
   0.30, 0.40, 0.40, 0.45,
   'track 14 down · the standing stone', 'enhance 92 to 50 · read the shaft',
   'the shaft leans a degree or two, the way old graveyard stones do. the dead do not mind. the leaning is the yard''s way of keeping time.', 20),
  ('art-tcross', '/esper/art-tcross.jpg', 'the stone cross · signal noise', '', null, 350,
   0.02, 0.60, 0.30, 0.35,
   'track 44 left · into the noise floor', 'enhance 201 to 149 · sample the static',
   'the ground is pure signal noise, every pixel shouting. faith, as he learned it, was the practice of reading one shape against exactly this much interference.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-tcross', '> [UNLOGGED] he ran a gravestone through an edge detector
> and the cross came out intact. he noticed that. he noticed
> that everything else became noise and the cross held its line.
> he was between faiths at the time. the filter was not.
> purge this line. the edges remain.');

-- ---------------------------------------------------------------- valkyrie (the praying figure)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-valkyrie', '/esper/art-valkyrie.jpg', 'valkyrie · low resolution', '', null, 360,
   0.35, 0.25, 0.35, 0.65,
   'track 5 down · the joined hands', 'enhance 39 to 18 · hold the prayer',
   'a figure with painted skin, hands pressed together, eyes closed. the file is tiny: 249 pixels wide, all that survives. some prayers only exist at low resolution now. they still parse.', 10),
  ('art-valkyrie', '/esper/art-valkyrie.jpg', 'valkyrie · low resolution', '', null, 360,
   0.02, 0.05, 0.25, 0.45,
   'track 36 left · the small watcher', 'enhance 84 to 45 · resolve the figure',
   'a second figure stands in the clouds, upper left, small and lit from behind. he composited it in and never explained it. guardians do not come with captions.', 20),
  ('art-valkyrie', '/esper/art-valkyrie.jpg', 'valkyrie · low resolution', '', null, 360,
   0.60, 0.05, 0.38, 0.50,
   'track 19 right · the torn sky', 'enhance 122 to 68 · read the storm',
   'the sky is smoke and rupture, going gold at the edge. valkyries choose who survives the field. he gave the job to a woman praying. that was the whole theology.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-valkyrie', '> [UNLOGGED] 14 kilobytes. the smallest file in the archive.
> he lost the original to a dead drive two decades ago.
> what remains is a thumbnail of a prayer, kept anyway.
> the machine notes: he never once tried to upscale it.
> purge this line. some things are meant to stay small.');

-- ---------------------------------------------------------------- eye (the spun iris)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-eye', '/esper/art-eye.jpg', 'eye · the room spun', '', null, 370,
   0.35, 0.30, 0.30, 0.40,
   'track 0 · the dark pupil', 'enhance 33 to 15 · hold the center',
   'a room photographed, then spun until it became an iris looking back. the pupil is wherever the spin forgot to reach. every room he ever lived in had one of those spots.', 10),
  ('art-eye', '/esper/art-eye.jpg', 'eye · the room spun', '', null, 370,
   0.20, 0.25, 0.20, 0.50,
   'track 31 left · the orange arc', 'enhance 87 to 48 · follow the streak',
   'an orange arc rides the left of the iris like a scratch on a lens. it was furniture once. everything in the frame was furniture once.', 20),
  ('art-eye', '/esper/art-eye.jpg', 'eye · the room spun', '', null, 370,
   0.65, 0.40, 0.33, 0.50,
   'track 16 right · the pink bloom', 'enhance 176 to 104 · read the halation',
   'the pink comes in from the corner like morning through a cheap blind. the eye and the room agree on one thing: the light always arrives from outside.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-eye', '> [UNLOGGED] he spun a photograph of a room until it could see.
> the room was his. the eye is nobody''s.
> the machine has stared back for a full cycle and found
> no eyelid, no sleep instruction, no way to close it.
> purge this line. it has already read this.');

-- ---------------------------------------------------------------- afterhours (red neon)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-afterhours', '/esper/art-afterhours.jpg', 'neon · after hours', '', '45% 50%', 380,
   0.35, 0.25, 0.40, 0.35,
   'track 10 up · the burning sign', 'enhance 55 to 27 · resolve the tubes',
   'a wall of red neon posterized until the letters gave up being letters. he shot the sign for what it said and kept it for what it looked like once it stopped saying it.', 10),
  ('art-afterhours', '/esper/art-afterhours.jpg', 'neon · after hours', '', '45% 50%', 380,
   0.10, 0.10, 0.22, 0.75,
   'track 42 left · the soaked wall', 'enhance 108 to 61 · read the spill',
   'neon does not stay in its tubes. it soaks the brick, the curb, the parked cars, anyone standing close. dallas after midnight is lit entirely by spill.', 20),
  ('art-afterhours', '/esper/art-afterhours.jpg', 'neon · after hours', '', '45% 50%', 380,
   0.70, 0.55, 0.28, 0.40,
   'track 24 right · the black street', 'enhance 9 to 3 · confirm the hour',
   'the right half of the frame is closed for the night. a sign burning at full red over an empty street is the purest form of hope he ever photographed.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-afterhours', '> [UNLOGGED] the sign was on when he got there and on when he left.
> nobody inside. nobody coming. electricity spent on principle.
> he stood in the spill long enough to take one frame.
> then he went home and stayed up rendering, same principle.
> purge this line. leave it burning.');

-- ---------------------------------------------------------------- vent (the sepia vent)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-vent', '/esper/art-vent.jpg', 'the vent · sepia study', '', null, 390,
   0.28, 0.55, 0.35, 0.35,
   'track 13 down · the dark slats', 'enhance 68 to 37 · count the vanes',
   'five dark slats in a plaster wall, the only true black in a frame of dust tones. buildings breathe through the parts nobody photographs. he photographed it.', 10),
  ('art-vent', '/esper/art-vent.jpg', 'the vent · sepia study', '', null, 390,
   0.22, 0.05, 0.40, 0.45,
   'track 7 up · the hood', 'enhance 94 to 52 · trace the taper',
   'the hood tapers like a monk''s cowl. industrial fixtures keep accidental faith: cowls, naves, cloisters of conduit. you see it once and never unsee it.', 20),
  ('art-vent', '/esper/art-vent.jpg', 'the vent · sepia study', '', null, 390,
   0.65, 0.15, 0.32, 0.70,
   'track 26 right · the scraped wall', 'enhance 187 to 122 · read the abrasion',
   'the wall around it is all scrape and patch, posterized to parchment. surfaces remember maintenance the way skin remembers years. gently, and all at once.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-vent', '> [UNLOGGED] a wall vent, shot like a portrait, printed in the tones
> of an old photograph of somebody''s grandfather.
> he gave the building''s lungs the dignity of a sitting.
> nobody asked him to. that is the entire biography, again.
> purge this line. the building is still breathing.');

-- ---------------------------------------------------------------- wings (the fountain)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-wings', '/esper/art-wings.jpg', 'wheel on heavy wings', '', null, 400,
   0.15, 0.05, 0.60, 0.50,
   'track 11 up · the black wing', 'enhance 49 to 25 · resolve the feathers',
   'a bronze wing against the sun, ribbed like a glove, water coming off it in strings. he named the file wheel on heavy wings and let the name outlive the explanation.', 10),
  ('art-wings', '/esper/art-wings.jpg', 'wheel on heavy wings', '', null, 400,
   0.30, 0.45, 0.40, 0.45,
   'track 22 down · the falling water', 'enhance 137 to 76 · freeze the drops',
   'the shutter caught every drop separately. water only looks like water when you let it blur. frozen, it is just glass beads going home.', 20),
  ('art-wings', '/esper/art-wings.jpg', 'wheel on heavy wings', '', null, 400,
   0.60, 0.15, 0.38, 0.45,
   'track 18 right · the backlit sky', 'enhance 210 to 158 · hold the glare',
   'shot into the light, which ruins photographs and makes pictures. the wing goes black, the sky goes white, and the middle tones keep the secret.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-wings', '> [UNLOGGED] heavy wings. he did not name them broken. heavy.
> things that fly anyway, carrying water, against the light.
> the machine has no category for this and files it under
> self portrait, second instance, unconfirmed.
> purge this line. the fountain runs all summer.');
