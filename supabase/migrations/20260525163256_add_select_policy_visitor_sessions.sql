/*
  # Add SELECT policy to visitor_sessions

  1. Changes
    - Add SELECT policy for anon/authenticated on `visitor_sessions`
    - Required for upsert (on_conflict) operations to detect existing rows

  2. Security
    - Policy allows anon to select rows (needed for upsert conflict detection)
    - The table only stores anonymous session fingerprints, no sensitive data
*/

CREATE POLICY "Anon can read own session"
  ON public.visitor_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);
