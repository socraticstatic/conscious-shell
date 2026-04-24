/*
  # Create app_logs table for in-app log tool

  1. New Tables
    - `app_logs`
      - `id` (uuid, primary key) - unique log entry id
      - `level` (text) - log level: log, info, warn, error, debug
      - `message` (text) - the log message
      - `details` (jsonb) - structured details (stack, args, metadata)
      - `source` (text) - origin hint (e.g. 'console', 'window.error', 'unhandledrejection')
      - `url` (text) - page URL where log occurred
      - `user_agent` (text) - browser user agent
      - `session_id` (text) - client-generated session identifier
      - `created_at` (timestamptz) - server-side timestamp

  2. Security
    - Enable RLS
    - Allow anonymous and authenticated users to INSERT logs (needed for client-side capture without auth)
    - Allow anonymous and authenticated users to SELECT logs (developer viewer tool)
    - No UPDATE/DELETE policies (logs are append-only for integrity)

  3. Indexes
    - Index on created_at DESC for fast recent-log queries
    - Index on level for filtering
    - Index on session_id for session grouping
*/

CREATE TABLE IF NOT EXISTS app_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'log',
  message text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'console',
  url text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS app_logs_created_at_idx ON app_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS app_logs_level_idx ON app_logs (level);
CREATE INDEX IF NOT EXISTS app_logs_session_id_idx ON app_logs (session_id);

CREATE POLICY "Anyone can insert logs"
  ON app_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read logs"
  ON app_logs FOR SELECT
  TO anon, authenticated
  USING (true);
