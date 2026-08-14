/*
  # The haiku, re-cut for ache and mystery

  Micah, 2026-08-14: "not in the same voice as the rest of the site."
  Eight of ten rewritten against the site's own materials - the snow lot,
  the backwards OPEN sign, the warehouse, the candle fleet, the mate.
  Two survive untouched: the empty conference room and Lima, which were
  already telling the truth. Source label updated: these are site-native,
  not from the COVID book.
*/

update portfolio_haiku set
  line1 = 'steam on the window',
  line2 = 'the day has not yet asked me',
  line3 = 'to be anyone',
  source = 'conscious_shell · night shift'
where line1 = 'the kettle is on';

update portfolio_haiku set
  source = 'conscious_shell · night shift'
where line1 = 'empty conference room';

update portfolio_haiku set
  line1 = 'the deploy at two',
  line2 = 'every window in the district',
  line3 = 'dark except for mine',
  source = 'conscious_shell · night shift'
where line1 = 'ship it, says the team';

update portfolio_haiku set
  line1 = 'the old warehouse door',
  line2 = 'still opens in my dreaming',
  line3 = 'onto younger noise',
  source = 'conscious_shell · night shift'
where line1 = 'the dog at the door';

update portfolio_haiku set
  line1 = 'thin snow on the lot',
  line2 = 'sodium light spending itself',
  line3 = 'on an empty fence',
  source = 'conscious_shell · night shift'
where line1 = 'spreadsheet of feelings';

update portfolio_haiku set
  line1 = 'a cursor adrift',
  line2 = 'on a board nobody watches',
  line3 = 'someone i was, once',
  source = 'conscious_shell · night shift'
where line1 = 'a figma cursor';

update portfolio_haiku set
  line1 = 'the mate goes bitter',
  line2 = 'i drink it the way he did',
  line3 = 'without complaining',
  source = 'conscious_shell · night shift'
where line1 = 'mate, steeping slowly';

update portfolio_haiku set
  line1 = 'i taught the machine',
  line2 = 'to imagine candle boats',
  line3 = 'it still asks for wind',
  source = 'conscious_shell · night shift'
where line1 = 'agent says: ready';

update portfolio_haiku set
  line1 = 'august in dallas',
  line2 = 'the OPEN sign reads backwards',
  line3 = 'from where i''m standing',
  source = 'conscious_shell · night shift'
where line1 = 'dallas, in august';

update portfolio_haiku set
  source = 'conscious_shell · night shift'
where line1 = 'lima, remembered';
