/*
  # Esper — three more frames, deeper ache

  Adds hotspots for three curated night/ache frames to `esper_hotspots`.
  Each frame gets three nodes (order_index 10/20/30). Enhancing all three of a
  frame's nodes in ascending order surfaces a hidden, unlogged fourth reveal in
  the client — the buried line. These rows are the visible noir; the ache sits
  just under it.

  Frames:
    - photo-1519608487953-e999c86e7455  empty neon tram corridor (magenta+cyan)
    - photo-1493514789931-586cb221d7a7  arterial grid at altitude (night aerial)
    - photo-1516617442634-75371039cb3a  roses against damaged steel (kintsugi)

  The two weakest legacy frames (green leaf, pendant light) are dropped from the
  client PHOTOS list; their rows are left in place, inert, and simply never queried.
*/

-- empty neon tram corridor -----------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1519608487953-e999c86e7455', '0.02', '0.10', '0.20', '0.40', 'track 8 left · hold', 'enhance 120 to 60 · isolate magenta', 'the shop lights are still on. no one is inside. someone left them burning for a person they were sure would walk back through that door. the light does not know it is waiting.', 10, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · empty tram corridor · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1519608487953-e999c86e7455', '0.42', '0.30', '0.16', '0.20', 'track 0 center · push', 'enhance 300% · temporal stack · hold', 'the street runs to a vanishing point and does not stop there. it keeps going after the photograph ends. that is the part the eye refuses. everything keeps going after you stop looking.', 20, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · empty tram corridor · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1519608487953-e999c86e7455', '0.30', '0.70', '0.40', '0.22', 'track 4 down · tilt 12', 'enhance 180% · descreen · rail-follow', 'two rails, exactly parallel, promised each other they would meet at the horizon. they were lying. they always were. people stood on them for a hundred years anyway. call it faith. call it the timetable.', 30, 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · empty tram corridor · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- arterial grid at altitude ----------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1493514789931-586cb221d7a7', '0.40', '0.45', '0.22', '0.30', 'track 12 right · descend', 'enhance 90 to 45 · isolate red', 'from up here the traffic is blood moving through a vein. the city has a pulse and it is not yours. it does not know your name. it beats anyway. it will beat after.', 10, 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · arterial grid at altitude · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1493514789931-586cb221d7a7', '0.04', '0.15', '0.18', '0.45', 'track 20 left · tilt 6 up', 'enhance 55% · window census', 'count the lit windows. every one is a person awake at this hour, certain they are the only one still up, the only one who feels it. they are wrong by ten thousand. that is the whole mercy and none of them will ever hear it.', 20, 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · arterial grid at altitude · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1493514789931-586cb221d7a7', '0.45', '0.05', '0.25', '0.14', 'track 0 center · hold at range', 'enhance 400% · atmospheric · long lens', 'there is a red light on the tallest tower, blinking. it has been saying the same single word for forty years. no one has answered it once. it does not slow down. it does not give up. it just keeps saying it into the dark, on schedule, forever.', 30, 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · arterial grid at altitude · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- roses against damaged steel --------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1516617442634-75371039cb3a', '0.03', '0.04', '0.20', '0.18', 'track 6 left · tilt 4 down', 'enhance 140% · isolate crimson', 'the tightest bud is the one that never opened. it held everything it was given and showed none of it. we told the boy that was strength. it was fear wearing a good coat. it browned at the edge still holding.', 10, 'https://images.unsplash.com/photo-1516617442634-75371039cb3a?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · roses against damaged steel · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1516617442634-75371039cb3a', '0.03', '0.48', '0.24', '0.20', 'track 2 left · center', 'enhance 88 to 44 · petal census', 'fully open, fully spent, the largest of the three. it gave itself away completely and left nothing in reserve and that is the exact reason it is the one you cannot look away from. the ones that hold back never move anybody.', 20, 'https://images.unsplash.com/photo-1516617442634-75371039cb3a?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · roses against damaged steel · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1516617442634-75371039cb3a', '0.55', '0.30', '0.32', '0.34', 'track 30 right · hold on ground', 'enhance 220% · surface forensics', 'the steel is nothing but scars. someone worked at this table for years and every scratch is a day he did not get back. and somebody laid flowers on it anyway. not to hide the damage. to say the damage was where the light was always going to get in.', 30, 'https://images.unsplash.com/photo-1516617442634-75371039cb3a?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · roses against damaged steel · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');
