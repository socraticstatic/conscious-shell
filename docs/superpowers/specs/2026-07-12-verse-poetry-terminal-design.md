# verse — poetry behind the terminal

**Date:** 2026-07-12
**Status:** approved (design), pending implementation plan

## Goal

Work Micah's poetry into conscious-shell.com. Constraint from Micah: **no pop-ups, no overlays.** Poetry is on-demand and earned — it lives behind the existing terminal and prints inline. Nothing new floats over the page.

## Decisions (from brainstorming)

- **Role:** on-demand, earned — discoverable via the terminal, not front-and-center.
- **Command shape:** `verse`, `verse list`, `verse <name|theme>`.
- **Corpus:** 32 poems. All 44 vault poems in `📝 Poems/` **except** the 6 that are about Micah's son Nova, cut for his privacy:
  `Nova`, `Still his dad`, `Tuesday night`, `What dads do`, `Inheritance`, `Mayakovski's Ghost`.
  `Abilene` is also dropped: its vault file holds only a Substack subscribe
  footer, no poem body (removed by migration `20260712030000`).
  Five AI-assisted songs are dropped too (chorus/verse tracks): Bring Back The
  Family Pride, Come As You Are, You've Been Waiting, In Your Arms, They say
  (migration `20260712040000`). 44 − 6 − 1 − 5 = 32.
- **Theme tag `nova` is stripped** from every seeded poem, so `verse nova` returns nothing rather than surfacing Peru/memoir poems that merely mention him.
- **Data source:** Supabase (never hardcoded content). New `poems` table, public read.

## Host: DeadDropConsole (existing)

`src/components/DeadDropConsole.tsx` is already a command terminal: backtick (or the control dock's `dock:deaddrop` event) opens it, `help` lists commands, and each command `push()`es output lines into the console's own scroll. A poem printed there is inline console text — no overlay is introduced. The console is the terminal Micah already invokes; we add commands to its existing `execute` switch.

## Data model

New table `public.poems`:

| column | type | notes |
|---|---|---|
| `id` | uuid pk, default `gen_random_uuid()` | |
| `slug` | text, unique, not null | kebab-case from title, ASCII-folded (`peru`, `the-road-taken`) — targets `verse <name>` |
| `title` | text, not null | display; shown by `verse list` |
| `body` | text, not null | full poem, newlines preserved |
| `themes` | text[], not null, default `'{}'` | `peru, faith, caryn, aging, memoir, heritage` — powers `verse <theme>`; `nova` removed |
| `order_index` | int, not null | stable ordering for `list` (alphabetical by title) |
| `created_at` | timestamptz, default `now()` | |

**RLS:** enable; one permissive `select` policy `to public using (true)` (matches every other content table now that the approval-gate wall is gone). No client insert/update — seeded by migration.

## Seeding

A migration (`supabase/migrations/<ts>_create_and_seed_poems.sql`) creates the table and inserts the 32 poems. It is **generated** by a one-off local script (not shipped) that:

1. Reads each `📝 Poems/*.md` file from the vault, skipping the 6 Nova poems.
2. Strips YAML frontmatter and the boilerplate "Find this track on your favorite music platform here." lead line where present.
3. Derives `slug` (ASCII-fold accents, lowercase, non-alnum → `-`), pulls `themes` from the vault index minus `nova`, assigns `order_index` alphabetically.
4. SQL-escapes bodies (single quotes doubled; newlines preserved via standard quoted string literals).

The generated `.sql` is committed and applied with `supabase db push`, consistent with the rest of the schema history. Bodies live in the migration so the corpus is reproducible and version-controlled.

## App loading

- Add `Poem` type to `src/lib/supabase.ts`.
- In `App.tsx`, the existing `data` fetch loads `poems` (`select('*').order('order_index')`) into `data.poems`.
- Pass to the console: `<DeadDropConsole poems={data?.poems ?? []} />`. The component currently takes no props; add an optional `poems?: Poem[]` prop (defaults to `[]`, so an empty/failed load degrades to "no verses loaded").

## Commands (new cases in `execute`)

Output is rendered with `push('out', line, color)` into the console scroll, styled in the terminal palette (title accent `#e040fb`, body `#c9b8a6`, a faint closing rule `#6b6660`). No byline — it's Micah's own site.

- **`verse`** — pick a random loaded poem; print title, blank line, body lines, closing rule. Body lines print with a small per-line stagger (like `scan`/`trace`) for a readable reveal.
- **`verse list`** — print each poem: `  <slug padded>  <title>   <themes joined>`. Lets a visitor choose.
- **`verse <arg>`** —
  - normalize arg (lowercase, ASCII-fold, trim);
  - if it matches a `slug` (or ASCII-folded title) → print that poem;
  - else if it matches a `theme` present in the corpus → print a random poem carrying that theme;
  - else → `no verse by that name · try "verse list"` (`#ff006e`).
- **`help`** gains a line: `verse          · read a poem`.
- If `poems` is empty: `verse` and `verse list` print `no verses loaded` gracefully.

## Discoverability: one palette entry

`src/components/CommandPalette.tsx` gains one `Cmd`:
`{ id: 'verse', label: 'cat /verse', hint: 'read a poem', run: () => { onClose(); window.dispatchEvent(new Event('verse:play')); } }`

`DeadDropConsole` listens for `verse:play`: it sets `open = true` and runs a random `verse`. (A dedicated event, not `dock:deaddrop`, to avoid the toggle closing an already-open console.) This is the only reach outside the terminal, and it just opens the terminal.

## No-overlay guarantee

Every poem renders as inline text inside the existing DeadDropConsole scroll. No modal, lightbox, toast, or new fixed layer is added. The palette entry opens the console the user already opens with backtick.

## Units & boundaries

- **`poems` table + seed migration** — owns the corpus; independent, reproducible.
- **`data.poems` load in App** — one fetch alongside the others; no new pattern.
- **`verse` command logic** — self-contained in the console's `execute`; a small pure helper `pickVerse(poems, arg)` (returns a poem or null) is unit-reasonable and keeps the switch case thin.
- **palette entry + `verse:play` listener** — the only cross-component wire; a single named event.

## Verification

1. Generate migration; `supabase db push`; confirm anon REST read of `poems` returns 38 rows and no `nova` in any `themes`.
2. `pnpm typecheck` + `pnpm build`.
3. Dev server: backtick to open console; run `verse`, `verse list`, `verse peru`, `verse perú` (accent-insensitive), `verse the-road-taken`, `verse aging`, `verse nova` (expect not-found), `verse zzz` (not-found). Confirm inline output, correct poems, no overlay.
4. Confirm the ⌘K `cat /verse` entry opens the console and prints a poem.
5. Confirm none of the 6 Nova poems are present (`verse list` and DB).

## Out of scope

- No dedicated poems page/route, no scroll section, no ambient auto-surfacing (rejected in favor of on-demand).
- No audio/TTS for poems (HaikuDeck has its own; not extended here).
- No admin UI to edit poems — corpus is migration-managed.
