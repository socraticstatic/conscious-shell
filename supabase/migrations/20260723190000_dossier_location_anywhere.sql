/*
  # Drop the fixed location from the dossier mentoring fact

  1. Changes
    - Rewrites the tail of the `mentoring` fact in `web_dossier_facts`
      from 'Operating out of Dallas, Texas.' to 'Operating from
      anywhere.'

  2. Why
    - The site no longer states a fixed city. The seed migration
      (20260422102044_create_web_dossier.sql) was edited to match, but
      that file is already applied, so the live row still carried the
      old text and the Dossier section kept rendering Dallas.
    - The Person JSON-LD in scripts/prerender.mjs dropped its
      `address` property in the same change, and llms.txt / agents.md
      now say "works from anywhere", so the entity graph stays
      internally consistent.

  3. Notes
    - Idempotent: matches on the exact old string, so re-running is a
      no-op once applied.
    - The row's `source_label` / `source_url` still point at
      rocketreach.co, which lists Dallas. The citation no longer
      supports the location clause.
*/

UPDATE web_dossier_facts
SET text = 'Mentor (and Advisory Board member) at CareerFoundry. Operating from anywhere.'
WHERE text = 'Mentor (and Advisory Board member) at CareerFoundry. Operating out of Dallas, Texas.';
