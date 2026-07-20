/*
  # De-duplicate the 2012 Ignite "Best Speaker" award

  1. Changes
    - Deletes the duplicate `portfolio_awards` row
      (title = 'Best Speaker — Ignite', organization = 'Ignite talks',
      order_index = 40), added 2026-04-21, one day after the original
      seed batch.

  2. Why
    - The same award was entered twice. The surviving row
      (title = 'Best Speaker', organization = 'Ignite', order_index = 30)
      came in with the original seed and follows the table's convention:
      `title` holds the award name, `organization` holds the org. The
      deleted row folded the org into the title, so the build-time
      prerender (scripts/prerender.mjs) emitted it into the Person
      JSON-LD `award` array as the doubled string
      'Best Speaker — Ignite — Ignite talks, 2012' alongside
      'Best Speaker — Ignite, 2012'.
    - Contradictory award facts in the entity graph weaken entity
      confidence for AI search engines. The visible Recognition section
      on the homepage also rendered both.

  3. Notes
    - Idempotent: matches on the specific id, so re-running is a no-op.
    - Deletes exactly one row. The other three awards are untouched, and
      their order_index values (10, 20, 30) leave no gap once 40 is gone.
*/

DELETE FROM portfolio_awards
WHERE id = 'e20c3e09-021c-4293-bfb7-6b741d640e3b';
