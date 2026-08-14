/*
  # The haiku, cut from canon this time

  Micah, 2026-08-14: "still don't contain the ache that the esper does -
  it's not me." Correct. The previous cut was mood pieces; his poems are
  first-person confessions that cost something. Eight rewritten from the
  canonical threads: the Chiclayo rooftop, the altar call, the drive home,
  the dropped name, the masks, the two anthems, the refusal to kneel, the
  world two people built. Two stay: the bitter mate and Lima's ocean,
  which were already his.
*/

update portfolio_haiku set
  line1 = 'on the dry-season roof',
  line2 = 'i watched the light go, learning',
  line3 = 'what loving would cost',
  mood = 'chiclayo'
where line1 = 'steam on the window';

update portfolio_haiku set
  line1 = 'i answered the call',
  line2 = 'at seven; some part of me',
  line3 = 'never walked back up',
  mood = 'altar'
where line1 = 'empty conference room';

update portfolio_haiku set
  line1 = 'he preached love sundays',
  line2 = 'three services, full pews, then',
  line3 = 'the quiet drive home',
  mood = 'father'
where line1 = 'the deploy at two';

update portfolio_haiku set
  line1 = 'friends stopped saying it',
  line2 = 'my own name, i mean; i kept',
  line3 = 'answering anyway',
  mood = 'the name'
where line1 = 'the old warehouse door';

update portfolio_haiku set
  line1 = 'the mask fit so well',
  line2 = 'that taking it off at last',
  line3 = 'took some of me too',
  mood = 'the masks'
where line1 = 'thin snow on the lot';

update portfolio_haiku set
  line1 = 'two anthems, one boy',
  line2 = 'standing for both, hand over',
  line3 = 'the wrong heart each time',
  mood = 'between worlds'
where line1 = 'a cursor adrift';

update portfolio_haiku set
  line1 = 'i was the one who',
  line2 = 'did not kneel; the room noticed',
  line3 = 'the room always does',
  mood = 'the refusal'
where line1 = 'i taught the machine';

update portfolio_haiku set
  line1 = 'somewhere a world stands',
  line2 = 'the two of us built; torches',
  line3 = 'still mine to keep lit',
  mood = 'the world'
where line1 = 'august in dallas';
