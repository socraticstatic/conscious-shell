/*
  # The art archive enters the esper machine

  Twelve frames of Micah's own digital art and photography, 1994-2005:
  Bryce-era renders, neon vector cutouts, body-glow figures, and night
  photography from the warehouse years. Curated 2026-08-14 from
  ~/Desktop/Esper with Micah; frames containing other people's faces and
  one misplaced work file were excluded. Files live in public/esper/.

  Follows the esper laws: no credit bylines, three nodes per frame in
  order_index 10/20/30, each frame carries its buried line in esper_frames.
  photo_order continues from 180 (the current ceiling) at 190+.
*/

-- ---------------------------------------------------------------- pipe (self portrait)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-pipe', '/esper/art-pipe.jpg', 'self portrait · blue period · the warehouse years', '', null, 190,
   0.35, 0.05, 0.45, 0.55,
   'track 12 right · hold on the face', 'enhance 40 to 12 · isolate gaze',
   'the eyes are lit from inside because he could not find a light he liked in the whole building. twenty-six and certain the glow meant something. it did. it meant the flash fired.', 10),
  ('art-pipe', '/esper/art-pipe.jpg', 'self portrait · blue period · the warehouse years', '', null, 190,
   0.05, 0.05, 0.20, 0.25,
   'track 30 left · climb to the corner', 'enhance 8 to 3 · resolve point source',
   'a lens flare he painted in by hand, because the real room had no stars. the warehouse had one window and it faced a wall.', 20),
  ('art-pipe', '/esper/art-pipe.jpg', 'self portrait · blue period · the warehouse years', '', null, 190,
   0.55, 0.70, 0.40, 0.25,
   'track 18 down · sweep the signature', 'enhance 300 to 210 · lift the name',
   'he signed it in lowercase and hid the letters in the dark, the way you hide a thing you want found.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-pipe', '> [UNLOGGED] subject photographed himself because no one else was there to.
> the pipe was a prop. the blue was not.
> he kept this file through eleven apartments and two countries.
> that is not archiving. that is checking a mirror.
> purge this line. it was never here.');

-- ---------------------------------------------------------------- snowlot (photograph)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-snowlot', '/esper/art-snowlot.jpg', 'first snow · the warehouse years', '', '50% 45%', 200,
   0.45, 0.10, 0.30, 0.20,
   'track 20 up · find the lit windows', 'enhance 80 to 55 · descreen glass',
   'someone was working late in the building across the lot. he never learned who. two lit rooms in an industrial district, each assuming the other was empty.', 10),
  ('art-snowlot', '/esper/art-snowlot.jpg', 'first snow · the warehouse years', '', '50% 45%', 200,
   0.30, 0.10, 0.15, 0.75,
   'track 4 left · hold the post', 'enhance 140 to 90 · isolate wire',
   'chain-link holds nothing in. it just tells you where the property line believes itself to be. the snow ignored it completely.', 20),
  ('art-snowlot', '/esper/art-snowlot.jpg', 'first snow · the warehouse years', '', '50% 45%', 200,
   0.55, 0.55, 0.40, 0.35,
   'track 26 down · follow the shadow', 'enhance 190 to 120 · unmatte sodium cast',
   'dallas snow, which is to say: gone by noon. he went out at 2 a.m. with the camera because he knew the morning would not keep it. some things you photograph instead of keeping.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-snowlot', '> [UNLOGGED] this exposure was made barefoot in tennis shoes, no coat.
> the party inside was still going. he stepped out alone.
> the fence, the sodium light, the untouched white.
> he stood there until his hands hurt and called it composition.
> purge this line. the snow did not last either.');

-- ---------------------------------------------------------------- chalpon (peru)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-chalpon', '/esper/art-chalpon.jpg', 'cruz de chalpón · the north road', '', null, 210,
   0.30, 0.30, 0.45, 0.45,
   'track 6 right · center the cross', 'enhance 60 to 35 · resolve silhouette',
   'the cruz de chalpón stands above motupe, an hour north of the city where he learned to ride a bike. pilgrims climb to it every august. he rendered it from texas, twenty years and four thousand miles from the road it watches.', 10),
  ('art-chalpon', '/esper/art-chalpon.jpg', 'cruz de chalpón · the north road', '', null, 210,
   0.45, 0.25, 0.30, 0.30,
   'track 2 up · into the burn', 'enhance 25 to 10 · hold the overexposure',
   'the sun behind it is blown out on purpose. in the north of peru the light does not describe things. it erases them and lets you decide what was there.', 20),
  ('art-chalpon', '/esper/art-chalpon.jpg', 'cruz de chalpón · the north road', '', null, 210,
   0.05, 0.02, 0.50, 0.25,
   'track 40 left · sweep the sky', 'enhance 210 to 160 · separate cyan channel',
   'the sky is the wrong color. memory does that. it files the important part under the wrong hue and refuses every correction.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-chalpon', '> [UNLOGGED] he was raised under crosses and spent thirty years walking away.
> this one he built himself, polygon by polygon, facing the sun.
> you do not render what you have escaped.
> you render what is still standing where you left it.
> purge this line. the cross stays.');

-- ---------------------------------------------------------------- melancolia (render)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-melancolia', '/esper/art-melancolia.jpg', 'melancolía · render · 4 a.m.', '', null, 220,
   0.35, 0.00, 0.35, 0.95,
   'track 0 · the cross owns the frame', 'enhance 100 to 60 · read the grain',
   'the cross is wine-red and takes the whole sky. this was rendered on a beige tower that took nine hours a frame. he set it running before bed like a prayer he could delegate.', 10),
  ('art-melancolia', '/esper/art-melancolia.jpg', 'melancolía · render · 4 a.m.', '', null, 220,
   0.00, 0.35, 0.30, 0.40,
   'track 44 left · into the chrome', 'enhance 75 to 40 · resolve reflection',
   'the chrome egg reflects a city that is not in the scene. raytracers do that: they show you what the geometry implies, whether or not you meant it. so do sons of preachers.', 20),
  ('art-melancolia', '/esper/art-melancolia.jpg', 'melancolía · render · 4 a.m.', '', null, 220,
   0.55, 0.30, 0.35, 0.35,
   'track 22 right · the sphere and the cube', 'enhance 55 to 30 · isolate pairing',
   'a sphere and a cube, waiting near the cross like witnesses. every belief system needs geometry that will not argue back.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-melancolia', '> [UNLOGGED] filename was melancolia. he was twenty-something and certain
> that naming the sadness in spanish made it art instead of inheritance.
> the render finished at 4 a.m. he was awake to see it.
> that is the part the file does not say. he was always awake.
> purge this line. está bien. he sleeps now. mostly.');

-- ---------------------------------------------------------------- ibleed (body of light)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-ibleed', '/esper/art-ibleed.jpg', 'i bleed, therefore i am', '', null, 230,
   0.35, 0.05, 0.35, 0.45,
   'track 8 up · hold the skull', 'enhance 30 to 14 · trace the fire lines',
   'the face is a map of everywhere the nerves run hot. he made this after learning that some people feel other people''s pain as their own, and that there is a gene for it, and that he has it.', 10),
  ('art-ibleed', '/esper/art-ibleed.jpg', 'i bleed, therefore i am', '', null, 230,
   0.20, 0.45, 0.60, 0.40,
   'track 14 down · the crossed arms', 'enhance 90 to 50 · follow the weave',
   'the arms cross the chest like a man holding himself together, which is what the pose is. descartes got it backwards. the thinking was never the proof.', 20),
  ('art-ibleed', '/esper/art-ibleed.jpg', 'i bleed, therefore i am', '', null, 230,
   0.02, 0.05, 0.25, 0.50,
   'track 38 left · into the black', 'enhance 5 to 1 · confirm absence',
   'the background is pure black, no floor, no room. pain does that. it deletes the set and leaves the actor.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-ibleed', '> [UNLOGGED] title reads as defiance. it was inventory.
> he bled easily his whole life: sermons, strangers, songs on the radio.
> mirrorless, the geneticists call it. nothing between him and the signal.
> he built interfaces for a living. this was the first one. no buffer.
> purge this line. it still transmits.');

-- ---------------------------------------------------------------- ireach (arms to the stars)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-ireach', '/esper/art-ireach.jpg', 'i reach for you · iii', '', null, 240,
   0.38, 0.30, 0.25, 0.35,
   'track 10 up · find the face', 'enhance 45 to 22 · lift the jaw line',
   'the head is tipped back, mouth closed. not shouting. receiving. there is a posture the body only takes when it believes something might actually answer.', 10),
  ('art-ireach', '/esper/art-ireach.jpg', 'i reach for you · iii', '', null, 240,
   0.02, 0.05, 0.30, 0.50,
   'track 52 left · along the arm', 'enhance 120 to 70 · resolve reach',
   'both arms all the way up. the third version, because the first two did not reach far enough. there is no fourth.', 20),
  ('art-ireach', '/esper/art-ireach.jpg', 'i reach for you · iii', '', null, 240,
   0.25, 0.60, 0.55, 0.35,
   'track 28 down · the broken chrome', 'enhance 160 to 95 · isolate fracture',
   'the torso is shattering into chrome and pearl. whatever he was reaching for, the reaching itself was taking him apart. he framed it anyway. that is the whole biography.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-ireach', '> [UNLOGGED] the you in the title has no antecedent in the file.
> god, a woman, the country he left, the self he was promised.
> the machine has run every candidate. confidence remains low.
> the arms are still up. that is the only stable reading.
> purge this line. keep reaching.');

-- ---------------------------------------------------------------- lovescreen (wireframe pair)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-lovescreen', '/esper/art-lovescreen.jpg', 'lovescreen · two figures', '', null, 250,
   0.30, 0.20, 0.30, 0.20,
   'track 16 up · the two heads', 'enhance 70 to 38 · separate faces',
   'two wireframe figures, faces almost touching, tipped back like a dance or a fall. from this distance the machine cannot tell an embrace from a struggle. neither could they.', 10),
  ('art-lovescreen', '/esper/art-lovescreen.jpg', 'lovescreen · two figures', '', null, 250,
   0.35, 0.35, 0.30, 0.25,
   'track 9 down · where the arms lock', 'enhance 85 to 45 · trace the hold',
   'the polygons interpenetrate at the shoulders. in 3d software that is an error called clipping: two bodies occupying the same space. in marriages it has other names.', 20),
  ('art-lovescreen', '/esper/art-lovescreen.jpg', 'lovescreen · two figures', '', null, 250,
   0.30, 0.72, 0.35, 0.15,
   'track 33 down · the stepping feet', 'enhance 110 to 60 · resolve stance',
   'one figure is stepping forward, one is braced. every couple is a physics problem: who moves, who absorbs.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-lovescreen', '> [UNLOGGED] wireframe means the surfaces were never computed.
> structure only. no skin, no faces, no way to tell who led.
> he rendered love without textures because textures were the part
> that kept failing in production.
> purge this line. the geometry was sound.');

-- ---------------------------------------------------------------- interface (title card)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-interface', '/esper/art-interface.jpg', 'human interface · title card', '', null, 260,
   0.15, 0.38, 0.70, 0.25,
   'track 0 · read the plate', 'enhance 50 to 25 · sharpen letterform',
   'INTERFACE, hammered gold on a rivet strip, 1990s industrial-goth. he made this for a project that never shipped. the word, however, went on to employ him for thirty years. jokes have long fuses.', 10),
  ('art-interface', '/esper/art-interface.jpg', 'human interface · title card', '', null, 260,
   0.40, 0.68, 0.25, 0.30,
   'track 21 down · the kneeling figure', 'enhance 95 to 55 · lift from static',
   'under the title, a figure kneels in the red noise. every interface has one: the human, below the fold, holding the whole composition up.', 20),
  ('art-interface', '/esper/art-interface.jpg', 'human interface · title card', '', null, 260,
   0.02, 0.02, 0.30, 0.35,
   'track 47 left · the wire circles', 'enhance 130 to 80 · count the coils',
   'barbed circles repeat into the corners like a pattern brush, which they were. constraint dressed as ornament. he would spend a career doing the reverse.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-interface', '> [UNLOGGED] subject titled this HUMAN INTERFACE at a time when his
> job title did not exist yet. the bodies in the static are reaching up.
> he thought he was making album art.
> he was drawing his own org chart.
> purge this line. the sequel was never rendered. it was lived.');

-- ---------------------------------------------------------------- paleolithic (deep time)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-paleolithic', '/esper/art-paleolithic.jpg', 'paleolithic sunset', '', '50% 55%', 270,
   0.15, 0.45, 0.35, 0.20,
   'track 19 left · the flock', 'enhance 65 to 33 · resolve wingforms',
   'five pterosaurs in loose formation over a molten sea. no land in frame. they are going somewhere on the strength of a rumor, which is how all migrations work.', 10),
  ('art-paleolithic', '/esper/art-paleolithic.jpg', 'paleolithic sunset', '', '50% 55%', 270,
   0.18, 0.65, 0.30, 0.20,
   'track 24 down · the water beneath them', 'enhance 145 to 85 · read the disturbance',
   'the water under the flock is textured with their passage. everything that flies drags a shadow across something. the shadow is the proof of the flight.', 20),
  ('art-paleolithic', '/esper/art-paleolithic.jpg', 'paleolithic sunset', '', '50% 55%', 270,
   0.00, 0.18, 0.95, 0.12,
   'track 3 up · the horizon band', 'enhance 200 to 150 · flatten haze',
   'the horizon is a gradient with no interruptions. sixty-six million years before anyone would call that minimalism.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-paleolithic', '> [UNLOGGED] rendered in a texas apartment by a kid from lima
> who had just learned the word extinct applied to more than animals.
> languages. neighborhoods. versions of yourself.
> he gave the doomed things a beautiful sky to cross.
> purge this line. they are still crossing it.');

-- ---------------------------------------------------------------- ferris (fair park)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-ferris', '/esper/art-ferris.jpg', 'texas star · fair park · looking up', '', '70% 35%', 280,
   0.72, 0.03, 0.18, 0.20,
   'track 15 up · the green gondola', 'enhance 42 to 20 · isolate cab',
   'the texas star, shot from directly below and posterized until it became a diagram of itself. the gondolas hang empty. off-season. the fair is eighteen days a year and the wheel stands there the other three hundred forty-seven.', 10),
  ('art-ferris', '/esper/art-ferris.jpg', 'texas star · fair park · looking up', '', '70% 35%', 280,
   0.62, 0.30, 0.18, 0.20,
   'track 9 down · the red gondola', 'enhance 58 to 30 · hold the drip',
   'the red cab is mid-drip in the posterization, like the color could not commit to staying inside the shape. state fairs are like that. joy with the registration slightly off.', 20),
  ('art-ferris', '/esper/art-ferris.jpg', 'texas star · fair park · looking up', '', '70% 35%', 280,
   0.75, 0.60, 0.22, 0.30,
   'track 31 right · into the lattice', 'enhance 105 to 62 · trace the struts',
   'the lattice does all the work and gets none of the ride. he had opinions about that arrangement. he was usually the lattice.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-ferris', '> [UNLOGGED] tallest ferris wheel in the hemisphere, the signs said.
> he shot it empty, from the ground, alone on a weekday.
> years later he would take his son and ride it and pay
> eleven dollars to see the same parking lots from above.
> purge this line. worth every dollar.');

-- ---------------------------------------------------------------- ruby (dallas neon)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-ruby', '/esper/art-ruby.jpg', 'ruby · neon · dallas', '', '55% 50%', 290,
   0.42, 0.10, 0.30, 0.35,
   'track 13 up · the revolver outline', 'enhance 48 to 24 · resolve the barrel',
   'a neon revolver over a pawn shop, tilted like it is being drawn. dallas keeps its history in signage. some cities get cathedrals.', 10),
  ('art-ruby', '/esper/art-ruby.jpg', 'ruby · neon · dallas', '', '55% 50%', 290,
   0.50, 0.42, 0.30, 0.25,
   'track 7 down · the name', 'enhance 66 to 36 · read RUBY',
   'RUBY in cream tube-glass. in this town that name is not neutral. a gun and that word on one sign, and the shop owner either never noticed or noticed completely.', 20),
  ('art-ruby', '/esper/art-ruby.jpg', 'ruby · neon · dallas', '', '55% 50%', 290,
   0.05, 0.30, 0.25, 0.40,
   'track 45 left · the dark margin', 'enhance 15 to 5 · confirm vacancy',
   'most of the frame is black. neon only works against a city that has gone home. so does memory.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-ruby', '> [UNLOGGED] he moved to a city famous for one afternoon in 1963
> and found it still paying the light bill on the evidence.
> a gun, a name, a buzzing transformer.
> he photographed it instead of asking anyone about it. safer.
> purge this line. the sign is gone now. the afternoon is not.');

-- ---------------------------------------------------------------- mbb (first renders)
insert into esper_hotspots
  (photo_id, photo_url, photo_caption, photo_credit, photo_pos, photo_order, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index)
values
  ('art-mbb', '/esper/art-mbb.jpg', 'the candle fleet · first renders', '', null, 300,
   0.30, 0.30, 0.30, 0.40,
   'track 5 right · the lead vessel', 'enhance 88 to 46 · resolve hull',
   'a machine like a ribbed lantern, riding a yellow sea. 1990s raytracing on borrowed hardware: every object a primitive, every material a guess. he was learning the tools by inventing a navy.', 10),
  ('art-mbb', '/esper/art-mbb.jpg', 'the candle fleet · first renders', '', null, 300,
   0.42, 0.13, 0.12, 0.25,
   'track 11 up · the flame', 'enhance 22 to 9 · hold the wick',
   'each vessel carries a single flame where a mast should be. propulsion by candlelight. it does not survive engineering review. it survives everything else.', 20),
  ('art-mbb', '/esper/art-mbb.jpg', 'the candle fleet · first renders', '', null, 300,
   0.68, 0.35, 0.28, 0.20,
   'track 36 right · the sister ships', 'enhance 170 to 110 · count the fleet',
   'two more on the horizon, identical, keeping distance. he always rendered fleets, never single ships. even his loneliness had a formation.', 30);

insert into esper_frames (photo_id, buried_line) values
  ('art-mbb', '> [UNLOGGED] earliest file in the archive. the gif still carries
> its 256-color palette like a boarding pass from 1994.
> a boy two years off the plane from lima, teaching a computer
> to imagine boats that run on candle flame.
> purge this line. the fleet is still out there. so is the boy.');
