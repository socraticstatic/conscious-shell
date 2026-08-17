/*
  # Lead source + company on contact_submissions

  /studio posts here with source='studio' so studio leads are separable
  from lab traffic. company is optional intake context. The existing lab
  form is untouched; defaults cover its inserts.
*/
alter table contact_submissions
  add column if not exists source text not null default 'site',
  add column if not exists company text not null default '';
