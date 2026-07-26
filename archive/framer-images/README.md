# Framer image archive

Every case study on conscious-shell.com pulls its hero image from
`framerusercontent.com` — the CDN of a Framer site that is no longer the
publishing platform for this portfolio. All 15 `portfolio_projects.image_url`
values point there, the images appear three times on each work page, and they
are also the `og:image` for every social share of that page.

They resolve today. The risk is not that the site breaks; it is that if Framer
ever expires those assets, the originals are gone and there is nothing to
restore from. This directory is that restore point.

Archived 2026-07-26, 15/15 downloaded, sizes and source URLs in `manifest.json`.

Nothing on the live site reads from this directory. Migrating the site to
self-hosted images is a separate decision: it means uploading these to Supabase
Storage or `public/`, updating 15 `image_url` rows, and re-running the
prerender so the JSON-LD and og:image follow. That has not been done.
