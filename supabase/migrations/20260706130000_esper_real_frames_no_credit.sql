/*
  # Esper — his own frames, no borrowed byline

  The previous pass added three frames that were NOT Micah's photography, under a
  fictional "@micahboswell" credit. This corrects that: removes those three stock
  frames' hotspots and replaces them with five of his own photographs (Unsplash
  @greyharbor7 — his account), each with reveals written to match what is actually
  in the frame. The visible credit byline is removed entirely in the component;
  these are his, no attribution needed.

  Removed (not his): neon tram corridor, night aerial, roses-on-steel.
  Added (his): el capitolio at night (Havana), the road into fog, two empty chairs,
  one anemone over its unopened buds, a single filament over dark water.

  The two remaining legacy non-his frames (blue door, white/blue building) are simply
  dropped from the client PHOTOS list; their rows stay inert and unqueried.
*/

-- undo the borrowed stock frames from 20260706120000 -------------------------
DELETE FROM esper_hotspots WHERE photo_id IN (
  'photo-1519608487953-e999c86e7455',
  'photo-1493514789931-586cb221d7a7',
  'photo-1516617442634-75371039cb3a'
);

-- el capitolio, after dark (Havana) ------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1603324905312-0f8fe8117cd8', '0.30', '0.05', '0.40', '0.30', 'track 0 center · tilt 30 up', 'enhance 120 to 60 · isolate sodium', 'a government lit from the inside and empty. the dome says permanence in a language the people who built it were promised and never got. it glows all night for no one. someone still pays the electric bill.', 10, 'https://images.unsplash.com/photo-1603324905312-0f8fe8117cd8?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · el capitolio, after dark', ''),
('photo-1603324905312-0f8fe8117cd8', '0.18', '0.42', '0.64', '0.12', 'track 4 down · hold on frieze', 'enhance 300% · glyph recovery', 'CAPITOLIO. carved once, meant forever. the letters outlast every man who stood beneath them swearing this time would be different. the stone does not keep score. it just keeps standing. that is not the same as keeping faith.', 20, 'https://images.unsplash.com/photo-1603324905312-0f8fe8117cd8?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · el capitolio, after dark', ''),
('photo-1603324905312-0f8fe8117cd8', '0.20', '0.62', '0.55', '0.30', 'track 8 down · descend', 'enhance 240% · doorway census', 'the steps are empty at this hour. a family left this country through a doorway like this one and mailed letters back that took decades to arrive. the building does not miss them. the doorway does.', 30, 'https://images.unsplash.com/photo-1603324905312-0f8fe8117cd8?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · el capitolio, after dark', '');

-- the road into fog ----------------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1676505073681-82b680b71725', '0.40', '0.26', '0.20', '0.26', 'track 0 center · push into fog', 'enhance 400% · atmospheric · hold', 'the road goes into the fog and the fog does not clear for the camera. you were taught the destination was the point. it was never the point. the walking was the point, and no one tells you that until the fog is most of what is left ahead.', 10, 'https://images.unsplash.com/photo-1676505073681-82b680b71725?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · the road into fog', ''),
('photo-1676505073681-82b680b71725', '0.70', '0.18', '0.28', '0.38', 'track 40 right · tilt 6 up', 'enhance 88 to 44 · isolate rust', 'the leaves on the right have already turned. they are most beautiful in the week they are dying. no one calls that tragic. we save the word for people, who are also most themselves in the light they are about to lose.', 20, 'https://images.unsplash.com/photo-1676505073681-82b680b71725?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · the road into fog', ''),
('photo-1676505073681-82b680b71725', '0.28', '0.62', '0.44', '0.32', 'track 6 down · rake the surface', 'enhance 200% · surface forensics', 'someone graded this road by hand once. you can still feel the crown of it under the leaves, the slight rise in the middle so the water would run off. a man did that so other people could get somewhere. he is not on the road anymore. the road is still here. that is the whole arrangement.', 30, 'https://images.unsplash.com/photo-1676505073681-82b680b71725?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · the road into fog', '');

-- two chairs, unoccupied -----------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1665697724166-5d6bfd0cdcbd', '0.10', '0.20', '0.35', '0.45', 'track 12 left · center', 'enhance 90 to 45 · isolate red', 'two chairs, angled toward each other the way you set them when you still expect the conversation to happen. no one is in either one. the ivy kept growing. the chairs kept waiting. objects are more faithful than we are, and it costs them nothing.', 10, 'https://images.unsplash.com/photo-1665697724166-5d6bfd0cdcbd?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · two chairs, unoccupied', ''),
('photo-1665697724166-5d6bfd0cdcbd', '0.45', '0.10', '0.35', '0.45', 'track 20 right · tilt 2 up', 'enhance 72 to 36 · measure the angle', 'the second chair is turned a few degrees away. small. you would not notice unless you were the one who set it. that is how it ends, usually. not a slammed door. a few degrees, over years, until you are both facing the garden instead of each other.', 20, 'https://images.unsplash.com/photo-1665697724166-5d6bfd0cdcbd?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · two chairs, unoccupied', ''),
('photo-1665697724166-5d6bfd0cdcbd', '0.42', '0.66', '0.34', '0.28', 'track 4 down · hold on stone', 'enhance 260% · wear pattern', 'someone set a single square stone into the gravel and wore a circle into its face over the years. a place to stand. a place to think. it is the closest thing here to a grave, and nobody died. that is what a garden is. rehearsal.', 30, 'https://images.unsplash.com/photo-1665697724166-5d6bfd0cdcbd?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · two chairs, unoccupied', '');

-- one bloom, three buds ------------------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1660258785270-45fa53c00e81', '0.42', '0.42', '0.30', '0.28', 'track 8 right · center', 'enhance 140% · isolate the open one', 'one flower opened all the way. fully, recklessly, everything showing, the yellow center handed to whatever was passing. that is the one the eye goes to. not the careful ones. the one that held nothing back, and will be gone first for exactly that reason.', 10, 'https://images.unsplash.com/photo-1660258785270-45fa53c00e81?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · one bloom, three buds', ''),
('photo-1660258785270-45fa53c00e81', '0.22', '0.68', '0.24', '0.24', 'track 6 down · tilt 4 down', 'enhance 88 to 44 · isolate violet', 'below it, a bud still wrapped tight in its purple case. safe. it tells itself it is being patient. it is being afraid. the open one already knows the thing the closed one is still refusing to hear: the point was never to last. the point was to open.', 20, 'https://images.unsplash.com/photo-1660258785270-45fa53c00e81?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · one bloom, three buds', ''),
('photo-1660258785270-45fa53c00e81', '0.02', '0.20', '0.34', '0.24', 'track 24 left · defocus pull', 'enhance 300% · recover the blur', 'behind the flowers, out of focus, a concrete overpass. someone poured that to move traffic and never once imagined a flower would be photographed against it. the ugly thing became the backdrop. that is grace, when it comes. by accident, in the blur, behind the thing you meant to look at.', 30, 'https://images.unsplash.com/photo-1660258785270-45fa53c00e81?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · one bloom, three buds', '');

-- a single filament over dark water ------------------------------------------
INSERT INTO esper_hotspots (photo_id, x, y, w, h, track_cmd, enhance_cmd, reveal, order_index, photo_url, photo_caption, photo_credit) VALUES
('photo-1660260964885-528df60aa658', '0.20', '0.44', '0.24', '0.24', 'track 4 left · center', 'enhance 160% · isolate the filament', 'one filament. one small orange line of it, doing the only thing it knows how to do. the whole park is behind it, out of focus, and none of that reaches the filament. it was given current and a job. it glows. there are worse ways to spend a life.', 10, 'https://images.unsplash.com/photo-1660260964885-528df60aa658?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · a single filament over dark water', ''),
('photo-1660260964885-528df60aa658', '0.18', '0.06', '0.30', '0.28', 'track 10 up · follow the cord', 'enhance 120% · trace the anchor', 'the cord comes in from the top of the frame and you cannot see where it is fixed. something up there, out of the shot, is holding the weight and taking no credit for it. most of what holds you up is out of the shot. you find out who, usually too late to thank them.', 20, 'https://images.unsplash.com/photo-1660260964885-528df60aa658?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · a single filament over dark water', ''),
('photo-1660260964885-528df60aa658', '0.55', '0.40', '0.40', '0.35', 'track 30 right · hold on water', 'enhance 240% · bloom recovery', 'behind the bulb the water has caught every other light and smeared it soft. the lake keeps none of them. it holds each light for exactly as long as the light is there, and lets it go without a mark. we call that a reflection. we could also call it the correct way to love something.', 30, 'https://images.unsplash.com/photo-1660260964885-528df60aa658?fm=jpg&q=75&w=1600&auto=format&fit=crop', 'case file #2049 · a single filament over dark water', '');
