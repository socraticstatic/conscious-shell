/*
  # Drop year from portfolio_projects

  1. Changes
    - Drops the `year` column from `portfolio_projects`. The portfolio year
      values were inaccurate across the board and the front end no longer
      renders them (Work list, Esper panel stat + FRAME caption, /index
      list, command palette were all updated), so the column is now unused
      dead data.

  2. Notes
    - Idempotent: only drops if the column still exists.
    - `portfolio_awards.year` is a separate column on a different table and
      is intentionally left intact.
    - No index, view, or foreign key references this column, so the drop is
      safe.
*/

ALTER TABLE portfolio_projects DROP COLUMN IF EXISTS year;
