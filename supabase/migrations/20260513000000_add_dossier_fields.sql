-- supabase/migrations/20260513000000_add_dossier_fields.sql
-- Adds STAR case study fields and gallery image array to portfolio_projects.
-- gallery_urls starts empty — populate asynchronously as assets become available.

ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS situation    TEXT,
  ADD COLUMN IF NOT EXISTS task         TEXT,
  ADD COLUMN IF NOT EXISTS action       TEXT,
  ADD COLUMN IF NOT EXISTS result       TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';
