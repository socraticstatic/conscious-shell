/*
  # Acumen is GE

  Micah confirmed 2026-08-14: Acumen was the GE Nuclear product — the
  role-based dashboard platform the Fortran unification shipped as. The
  two rows carrying client 'Acumen' are GE work under the product's name.

  1. GE Nuclear case study gets its image (the 2016 Acumen product shot,
     reactor-core fuel map on screen, now at /work/ge-nuclear-fortran-
     unification.png) and its summary names the platform.
  2. The two Acumen rows get client 'GE Nuclear' so the three rows tell
     one story. Titles are untouched — slugs derive from titles, and the
     existing /work/acumen* URLs keep resolving.
*/

update portfolio_projects
set
  image_url = 'https://conscious-shell.com/work/ge-nuclear-fortran-unification.png',
  summary = 'Proposed and led the unification of hundreds of legacy Fortran applications into role-based dashboards, shipped as the Acumen platform. One source of truth where there had been hundreds. Error rates fell 48%, with federal nuclear compliance preserved throughout.'
where title = 'GE Nuclear — Fortran Unification';

update portfolio_projects
set client = 'GE Nuclear'
where client = 'Acumen';
