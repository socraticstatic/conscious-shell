/*
  # Add screenshot URLs to archive captures

  Iframe embeds of Wayback snapshots are blocked by archive.org's X-Frame-Options
  on most captures. Swap to flat images: render each era as a screenshot taken by
  the microlink.io service (their CDN caches results, so repeat loads are fast).

  ## Changes
  - `archive_captures`
    - adds `screenshot_url` text — auto-generated URL that resolves to a PNG
    - adds `custom_screenshot_url` text — optional manual override, supersedes
      the auto URL whenever it is set (e.g. for hand-curated screenshots dropped
      into Supabase Storage later)

  No existing data is modified destructively; new columns default to empty strings.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_captures' AND column_name = 'screenshot_url'
  ) THEN
    ALTER TABLE archive_captures ADD COLUMN screenshot_url text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'archive_captures' AND column_name = 'custom_screenshot_url'
  ) THEN
    ALTER TABLE archive_captures ADD COLUMN custom_screenshot_url text NOT NULL DEFAULT '';
  END IF;
END $$;

UPDATE archive_captures
SET screenshot_url =
  'https://api.microlink.io/?url=' ||
  replace(replace(replace(replace(replace(replace(wayback_url,
    ':', '%3A'), '/', '%2F'), '?', '%3F'), '#', '%23'), '&', '%26'), ' ', '%20') ||
  '&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&waitFor=3000'
WHERE screenshot_url = '';
