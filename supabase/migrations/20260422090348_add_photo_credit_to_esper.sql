/*
  # Add photo credit to esper_hotspots

  1. Modified Tables
    - `esper_hotspots`
      - Added `photo_credit` (text) — attribution string for the photograph

  2. Notes
    - Defaults to empty string so existing rows remain valid
    - No policy changes required
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esper_hotspots' AND column_name = 'photo_credit'
  ) THEN
    ALTER TABLE esper_hotspots ADD COLUMN photo_credit text NOT NULL DEFAULT '';
  END IF;
END $$;
