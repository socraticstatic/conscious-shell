/*
  # Drop the Abilene stub — Substack footer, not a poem

  Abilene.md in the vault holds only a Substack call-to-action ("Thanks for
  reading Fundamentally Yours! Subscribe for free...") and no actual poem
  body, so the seed in 20260712020000 stored the footer as the poem. Remove
  any such boilerplate-only row. Precise match on the Substack footer text;
  the 37 real poems are untouched.
*/

delete from public.poems
where body ~* 'thanks for reading|subscribe for free|fundamentally yours';
