/*
  # Case studies carry their numbers

  The consulting funnel (💼 Consulting/Practice_Strategy.md) rests on three
  proof points with measured outcomes: GE 48%, Mint 31%/20%, AT&T $300K+.
  Two of the three rows existed but read as generic capability copy with no
  numbers, and GE had no row at all. All figures below come from the public
  resume (socraticstatic/resume, index.html) — nothing here exceeds what is
  already published there.

  1. New row: GE Nuclear — Fortran Unification (48% error reduction).
     No image yet; CaseStudy.tsx and the work grid tolerate an empty
     image_url. order_index 85 slots it between Acumen (80) and Mint (90).
  2. US Mint summary rewritten to carry 31% cart abandonment / +20% revenue.
  3. AT&T summary rewritten: the old text said "consumer-facing experiences",
     which the role never was. Now names the Agentic framework, the DNI
     Portal $300K+ savings, and the weeks-to-minutes triage outcome.
*/

insert into portfolio_projects (title, role, client, summary, tags, image_url, order_index, featured)
values (
  'GE Nuclear — Fortran Unification',
  'UX Consultant',
  'GE Nuclear',
  'Proposed and led the unification of hundreds of legacy Fortran applications into role-based dashboards. One source of truth where there had been hundreds. Error rates fell 48%, with federal nuclear compliance preserved throughout.',
  array['Design Systems', 'Enterprise', 'Energy'],
  '',
  85,
  false
);

update portfolio_projects
set summary = 'First persona-driven e-commerce strategy for a government retailer. Five buyer personas aligned retail, web, and collector channels around a single customer model. Cart abandonment fell 31%. Revenue rose 20%.'
where title = 'US Mint — Omnichannel Strategy';

update portfolio_projects
set summary = 'Architected the Agentic framework: modular AI agents managing the network infrastructure lifecycle from provisioning to decommissioning. Redesigned DNI Portal diagnostics, saving $300K+ in hardware. Built VLAN triage tools that cut resolution from weeks to minutes.'
where title = 'AT&T Product Design';
