/*
  # Add photo_id to esper_hotspots

  1. Changes
    - Adds `photo_id` column to `esper_hotspots` to identify which photo each hotspot belongs to
    - Sets existing hotspots to the elevator photo ID
    - Inserts hotspot data for all 7 additional photos

  2. Notes
    - Each photo now has its own set of interactive hotspots with unique reveal text
    - Hotspots reference photos by their Unsplash photo ID string
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esper_hotspots' AND column_name = 'photo_id'
  ) THEN
    ALTER TABLE esper_hotspots ADD COLUMN photo_id text DEFAULT 'photo-1666554757112-91093a627335';
  END IF;
END $$;

-- Insert hotspots for: blue light streaks
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1601743240194-f45724587958', '0.10', '0.15', '0.22', '0.24', 'track 12 left · tilt 4 up', 'enhance 180 to 90 · isolate blue channel', 'light bends where it should not. the streak is not from the lens — something moved through the exposure window.', 10, 'https://images.unsplash.com/photo-1601743240194-f45724587958?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue light streaks · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1601743240194-f45724587958', '0.55', '0.10', '0.25', '0.20', 'track 66 right · tilt 2 up', 'enhance 44 to 28 · split luminance', 'parallel traces. two objects in motion at different velocities. one is the camera. one is not.', 20, 'https://images.unsplash.com/photo-1601743240194-f45724587958?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue light streaks · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1601743240194-f45724587958', '0.30', '0.55', '0.26', '0.28', 'track 0 center · tilt 18 down', 'enhance 300% · temporal stack · hold', 'the ground plane holds a secondary reflection. a timestamp embedded in concrete. 22:47.', 30, 'https://images.unsplash.com/photo-1601743240194-f45724587958?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue light streaks · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: blue wooden door
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1542484183-17a107e68edf', '0.35', '0.08', '0.30', '0.20', 'track 0 center · tilt 12 up', 'enhance 120 to 60 · descreen · sharpen', 'paint layering reveals three previous colors beneath the blue. each layer a different tenant. each tenant gone.', 10, 'https://images.unsplash.com/photo-1542484183-17a107e68edf?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue wooden door · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1542484183-17a107e68edf', '0.10', '0.40', '0.20', '0.30', 'track 28 left · tilt 4 down', 'enhance 88 to 44 · isolate grain structure', 'hinge shadow does not match the door angle. this frame was taken from inside looking out.', 20, 'https://images.unsplash.com/photo-1542484183-17a107e68edf?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue wooden door · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1542484183-17a107e68edf', '0.60', '0.50', '0.24', '0.30', 'track 40 right · tilt 12 down', 'enhance 200% · contrast stretch · hold', 'scratch pattern near the lock is deliberate. someone marked this door. a ward cipher in wood.', 30, 'https://images.unsplash.com/photo-1542484183-17a107e68edf?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · blue wooden door · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: green stone fragment
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1608688107623-c5e228d8df63', '0.12', '0.10', '0.24', '0.26', 'track 16 left · tilt 8 up', 'enhance 160 to 80 · isolate green band', 'mineral composition reads wrong for this latitude. this stone was moved here from elsewhere.', 10, 'https://images.unsplash.com/photo-1608688107623-c5e228d8df63?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green stone fragment · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1608688107623-c5e228d8df63', '0.50', '0.30', '0.28', '0.24', 'track 44 right · tilt 2 down', 'enhance 55 to 33 · spectral shift', 'fracture line is too clean for natural erosion. this was cut. precision reads sub-millimeter.', 20, 'https://images.unsplash.com/photo-1608688107623-c5e228d8df63?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green stone fragment · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1608688107623-c5e228d8df63', '0.20', '0.60', '0.30', '0.26', 'track 6 left · tilt 20 down', 'enhance 240% · false color · hold', 'embedded within the grain: a fossil. not stone at all. compressed time, wearing a mineral disguise.', 30, 'https://images.unsplash.com/photo-1608688107623-c5e228d8df63?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green stone fragment · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: white and blue building
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1559313240-d9398a1ce018', '0.30', '0.05', '0.30', '0.22', 'track 0 center · tilt 18 up', 'enhance 100 to 50 · keystone correct', 'the roofline vanishing point is offset. this building was not photographed from ground level.', 10, 'https://images.unsplash.com/photo-1559313240-d9398a1ce018?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · white and blue building · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1559313240-d9398a1ce018', '0.08', '0.35', '0.22', '0.28', 'track 30 left · tilt 4 down', 'enhance 66 to 38 · shadow lift · hold', 'window reflection contains a secondary structure not present in the scene. a building that no longer exists.', 20, 'https://images.unsplash.com/photo-1559313240-d9398a1ce018?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · white and blue building · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1559313240-d9398a1ce018', '0.58', '0.45', '0.26', '0.30', 'track 52 right · tilt 10 down', 'enhance 180% · edge detect · unmask', 'paint peels in a pattern. not weather damage. someone wrote here. the wall remembers a name.', 30, 'https://images.unsplash.com/photo-1559313240-d9398a1ce018?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · white and blue building · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: red and brown ceiling
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1601742891608-9c1577b3a4b3', '0.15', '0.10', '0.26', '0.24', 'track 14 left · tilt 14 up', 'enhance 140 to 70 · red channel isolate', 'wood grain reads as old-growth. this beam predates the building around it. repurposed from a ship hull.', 10, 'https://images.unsplash.com/photo-1601742891608-9c1577b3a4b3?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · red and brown ceiling · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1601742891608-9c1577b3a4b3', '0.50', '0.15', '0.28', '0.26', 'track 48 right · tilt 10 up', 'enhance 72 to 36 · descreen · pattern match', 'joint pattern is hand-cut. no two are identical. the carpenter was left-handed. the chisel tells.', 20, 'https://images.unsplash.com/photo-1601742891608-9c1577b3a4b3?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · red and brown ceiling · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1601742891608-9c1577b3a4b3', '0.25', '0.55', '0.30', '0.28', 'track 4 left · tilt 16 down', 'enhance 260% · thermal overlay · hold', 'stain pattern reads as water damage but the shape is wrong. deliberate. someone poured something here.', 30, 'https://images.unsplash.com/photo-1601742891608-9c1577b3a4b3?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · red and brown ceiling · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: green and brown leaf
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1560946352-188f23e76712', '0.10', '0.20', '0.24', '0.26', 'track 18 left · tilt 2 up', 'enhance 120 to 60 · chlorophyll map', 'vein pattern is asymmetric. this leaf grew in artificial light. the spectrum was incomplete.', 10, 'https://images.unsplash.com/photo-1560946352-188f23e76712?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green and brown leaf · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1560946352-188f23e76712', '0.48', '0.12', '0.28', '0.24', 'track 42 right · tilt 6 up', 'enhance 90 to 45 · edge frequency · hold', 'insect trail encoded in the surface damage. the path is not random. it spells something in braille.', 20, 'https://images.unsplash.com/photo-1560946352-188f23e76712?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green and brown leaf · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1560946352-188f23e76712', '0.22', '0.58', '0.30', '0.26', 'track 0 center · tilt 20 down', 'enhance 320% · decay rate analysis', 'the brown at the margins is not death. it is transformation. the leaf is writing its own record.', 30, 'https://images.unsplash.com/photo-1560946352-188f23e76712?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · green and brown leaf · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');

-- Insert hotspots for: pendant light
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit)
VALUES
('photo-1542768581-0ddb91c116ef', '0.32', '0.05', '0.28', '0.24', 'track 0 center · tilt 16 up', 'enhance 110 to 55 · filament trace', 'the bulb is not Edison. the coil geometry is Marconi-era. this fixture was never meant for light alone.', 10, 'https://images.unsplash.com/photo-1542768581-0ddb91c116ef?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · pendant light · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1542768581-0ddb91c116ef', '0.12', '0.40', '0.22', '0.28', 'track 26 left · tilt 6 down', 'enhance 78 to 40 · bokeh inversion', 'background blur contains geometry. hexagonal iris — the camera that took this was military surplus.', 20, 'https://images.unsplash.com/photo-1542768581-0ddb91c116ef?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · pendant light · m. boswell', 'photo · micah boswell / unsplash · @micahboswell'),
('photo-1542768581-0ddb91c116ef', '0.55', '0.50', '0.26', '0.30', 'track 38 right · tilt 14 down', 'enhance 280% · spectral emission · hold', 'color temperature reads 2200K. but there is a spike at 589nm. sodium contamination. this room is near a highway.', 30, 'https://images.unsplash.com/photo-1542768581-0ddb91c116ef?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · pendant light · m. boswell', 'photo · micah boswell / unsplash · @micahboswell');
