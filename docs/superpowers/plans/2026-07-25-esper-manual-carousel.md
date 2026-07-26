# Esper Machine — Manual Carousel, Data-Driven Frames, More Photographs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the reader control of the Esper frame instead of yanking it away every 25 seconds, recover four frames of prose that are stranded in the database, and add more of Micah's own photographs.

**Architecture:** `EsperScene.tsx` is DOM + Tailwind + framer-motion — no three.js despite the dependency existing for other components. Frames currently come from a hardcoded 9-entry array in the component; hotspots come from Supabase. This plan inverts that so the data is the single source of truth, and replaces the auto-advance interval with the manual-with-pause pattern `HaikuDeck.tsx` already uses in this same codebase.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind (bare config, inline hex), framer-motion, Supabase, lucide-react.

## Global Constraints

- **No new dependencies.** `.bolt/prompt`: *"Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them."* `ChevronLeft`/`ChevronRight` already come from `lucide-react`, which is already used in `Certifications.tsx`, `OverrideMode.tsx` and `MobileControlDock.tsx`.
- **One easing curve for every esper motion.** `ESPER_EASE = [0.22, 1, 0.36, 1]`, declared at `EsperScene.tsx:8-10` and mirrored in `EsperPanel.tsx:26,40,57`. Carousel transitions use it too.
- **The colour law**, from `docs/superpowers/specs/2026-07-06-esper-harmonize-ache-design.md:32-36`, quoted verbatim: *"One shared law: cyan `#00d4ff` = tracking, magenta `#e040fb` = locked/revealed, in both components."* Carousel chrome is cyan when available, magenta when active. No third accent.
- **The palette is inline hex, no Tailwind theme.** `#05060a` section bg, `#0a0a0d` terminal panel, `#1f1c17` hairline, `#e8e4dc` reveal prose, `#c9b8a6` terminal log, `#a8a29e`/`#6b6660`/`#4a453e` descending grays.
- **Type:** `font-mono` for chrome and terminal, `font-serif` for the reveal prose, `tracking-[0.3em]`–`[0.5em]` uppercase micro-labels at `text-[9px]`/`text-[10px]`.
- **The prose is not to be edited.** The `reveal` field is the thing Micah values most in this component. Move it, re-key it, never rewrite it.
- **There are no tests in this repo.** Verification is `pnpm typecheck && pnpm lint && pnpm build`, then the dev server in a browser.

## Decisions already made — do not relitigate

Answered by Micah, 2026-07-25:

1. **`@micahboswell` is his real Unsplash handle.** The comment at `EsperScene.tsx:12` naming `@greyharbor7` and the header of `supabase/migrations/20260706130000_esper_real_frames_no_credit.sql` calling `@micahboswell` *"a fictional credit"* are both **wrong** and are corrected in Task 1. His own author bio in `~/Documents/CreativeAssistant/Books/Cancel Culture Book/Cancel Culture.md:655` and `supabase/migrations/20260422102044_create_web_dossier.sql:68` are correct.
2. **Only deliberate hotspot clicks advance the buried-line streak.** Stepping frames with next/prev must not satisfy it.
3. **Frames are read from the data.** The hardcoded `PHOTOS` array goes away; the four orphaned frames come back.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/components/EsperScene.tsx` | The whole component | Modify — frame source, carousel, streak scope |
| `src/lib/supabase.ts:104-118` | `EsperHotspot` type | Modify — add the fields the component will now read |
| `supabase/migrations/<ts>_esper_frame_metadata.sql` | Caption/credit correction + new frames | Create |
| `docs/superpowers/specs/2026-07-06-esper-harmonize-ache-design.md` | The design law | Modify — append the carousel rules |

---

### Task 1: Correct the handle, in code and in the record

A prior agent asserted in a commit that Micah's real Unsplash handle is fictional and substituted a different one. That claim propagated into a migration header and a source comment. Fix it before building on top of it.

**Files:**
- Modify: `src/components/EsperScene.tsx:12`
- Create: `supabase/migrations/<timestamp>_esper_correct_photo_credit.sql`

- [ ] **Step 1: Find every occurrence**

```bash
cd ~/Developer/conscious-shell
grep -rn "greyharbor" --include=*.tsx --include=*.ts --include=*.sql --include=*.md . | grep -v node_modules
grep -rn "fictional" supabase/migrations/ | grep -i unsplash
```

- [ ] **Step 2: Correct the source comment**

`EsperScene.tsx:12` currently reads that the photos are *"Unsplash @greyharbor7 — his account."* Replace with:

```ts
// Every frame is Micah's own photograph, published on Unsplash as
// @micahboswell. A 2026-07-06 pass asserted this handle was fictional and
// substituted @greyharbor7; that was wrong. Corroborated by his author bio in
// the vault and by supabase/migrations/20260422102044_create_web_dossier.sql.
```

- [ ] **Step 3: Write the corrective migration**

```sql
-- Correct the photographer credit.
--
-- 20260706130000_esper_real_frames_no_credit.sql claimed @micahboswell was a
-- fictional credit and blanked photo_credit on the frames it added. It is his
-- real handle. Restoring a consistent credit across every row so the column
-- stops carrying two different stories.
update esper_hotspots
set photo_credit = 'photo · micah boswell / unsplash · @micahboswell'
where coalesce(photo_credit, '') = ''
   or photo_credit ilike '%greyharbor%';
```

- [ ] **Step 4: Apply and verify**

```bash
node scripts/apply-migrations.mjs
```

Then confirm no row disagrees:

```bash
node -e '
const {createClient}=require("@supabase/supabase-js");
require("dotenv").config();
const sb=createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY);
sb.from("esper_hotspots").select("photo_credit").then(({data})=>{
  const u=[...new Set(data.map(r=>r.photo_credit))];
  console.log(u); console.log(u.length===1?"OK: one credit":"MIXED");
});'
```
Expected: `OK: one credit`.

- [ ] **Step 5: Commit**

```bash
git add src/components/EsperScene.tsx supabase/migrations
git commit -m "fix: @micahboswell is the real Unsplash handle, not fictional

A 2026-07-06 pass asserted the credit was fictional and wrote @greyharbor7
into the component and a migration header. It contradicted his own author
bio and the web_dossier migration. Corrected in both places."
```

---

### Task 2: Read frames from the data

`EsperScene.tsx:16-26` hardcodes nine frames. The table holds thirteen. Four frames and twelve `reveal` passages are unreachable — the migration comment at `20260706130000` calls them *"inert and unqueried."* The component also ignores the DB's `photo_url`, `photo_caption` and `photo_credit`, rebuilding the URL from `photo_id` and using its own captions, so screen and database already disagree.

**Files:**
- Modify: `src/lib/supabase.ts:104-118`
- Modify: `src/components/EsperScene.tsx:16-26, 73-78`

**Interfaces:**
- Produces: `type EsperFrame = { photoId: string; url: string; caption: string; credit: string; pos?: string; hotspots: EsperHotspot[] }` and `buildFrames(hotspots: EsperHotspot[]): EsperFrame[]`, both consumed by Task 3.

- [ ] **Step 1: Add the missing fields to the type**

In `src/lib/supabase.ts:104-118`, ensure `EsperHotspot` carries `photo_url`, `photo_caption`, `photo_credit` and an optional `photo_pos`. If `photo_pos` does not exist as a column, add it in the Task 1 migration file — several frames are portraits that need an `object-position` to survive the 16:10 crop, and that value belongs with the frame, not in code.

- [ ] **Step 2: Build frames from the rows**

Replace the `PHOTOS` array and the `currentPhotoId` filter with:

```ts
export type EsperFrame = {
  photoId: string;
  url: string;
  caption: string;
  credit: string;
  pos?: string;
  hotspots: EsperHotspot[];
};

/**
 * Group hotspot rows into frames.
 *
 * The frame list used to be a hardcoded 9-entry array in this file while the
 * table held 13, which stranded 4 frames and 12 reveal passages. Deriving the
 * list from the data means a new frame is an INSERT, not a code change, and the
 * caption on screen is the caption in the database.
 *
 * Row order is preserved from the query's `order by order_index`; frame order
 * follows first appearance, so the sequence is editable from the data too.
 */
export function buildFrames(hotspots: EsperHotspot[]): EsperFrame[] {
  const byPhoto = new Map<string, EsperFrame>();
  for (const h of hotspots) {
    if (!h.photo_id) continue;
    let frame = byPhoto.get(h.photo_id);
    if (!frame) {
      frame = {
        photoId: h.photo_id,
        url:
          h.photo_url ||
          `https://images.unsplash.com/${h.photo_id}?fm=jpg&q=75&w=1600&auto=format&fit=crop`,
        caption: h.photo_caption || '',
        credit: h.photo_credit || '',
        pos: h.photo_pos || undefined,
        hotspots: [],
      };
      byPhoto.set(h.photo_id, frame);
    }
    frame.hotspots.push(h);
  }
  return [...byPhoto.values()];
}
```

- [ ] **Step 3: Verify the count moved from 9 to 13**

Add a temporary `console.log(frames.length, frames.map(f => f.hotspots.length))`, run `pnpm dev`, and check the console.
Expected: `13` frames, with node counts `[3,3,3,3,3,3,3,4,3,3,3,3,3]` — 40 hotspots total. Remove the log before committing.

- [ ] **Step 4: Check the recovered captions**

Four recovered frames carry the `· m. boswell` byline that the July pass deliberately stripped from the newer ones. Normalize them in the Task 1 migration so all thirteen read consistently. Do not touch the `reveal` prose.

- [ ] **Step 5: Typecheck, lint, build**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/EsperScene.tsx src/lib/supabase.ts supabase/migrations
git commit -m "feat(esper): derive frames from the data, recovering 4 lost frames

The component filtered against a hardcoded 9-entry PHOTOS array while the
table held 13 photo_ids, so 4 frames and 12 reveal passages were unreachable.
It also ignored photo_url/photo_caption/photo_credit and rebuilt them, so
screen and database disagreed. A new frame is now an INSERT."
```

---

### Task 3: Replace the 25-second interval with a manual carousel

`EsperScene.tsx:53-69` advances the frame on a `setInterval` every 25 seconds and wipes all state on change — so a reader partway through a reveal loses it. This is the defect.

`HaikuDeck.tsx` in this same repo already solves the shape: `idx` + `paused`, a rAF-driven progress bar that pauses mid-tick, a clickable index for direct jumps, and a header counter. Copy that, add prev/next, and default to paused.

**Files:**
- Modify: `src/components/EsperScene.tsx:53-69` (delete the interval), plus the frame header and a new control row

**Interfaces:**
- Consumes: `EsperFrame[]` and `buildFrames` from Task 2.

- [ ] **Step 1: Read the pattern before writing**

Run: `sed -n '1,60p' src/components/HaikuDeck.tsx` and `sed -n '95,180p' src/components/HaikuDeck.tsx`. Note the rAF progress loop at lines 19-40 and the direct-jump list at line 165. Follow it rather than inventing a second carousel idiom in the same codebase.

- [ ] **Step 2: Delete the interval, add carousel state**

Replace `EsperScene.tsx:53-69` with:

```ts
const [frameIdx, setFrameIdx] = useState(0);

// Manual by default. The frame used to advance on a 25s setInterval and wipe
// all state with it, so a reader partway through a reveal lost the reveal.
// Reading is the point of this component; it does not get interrupted.
const goToFrame = useCallback(
  (next: number) => {
    setFrameIdx((prev) => {
      const n = frames.length;
      if (n === 0) return prev;
      return ((next % n) + n) % n;
    });
  },
  [frames.length],
);

// Frame change resets the terminal, exactly as before. The streak resets too:
// a streak is per-frame by definition.
useEffect(() => {
  clearAll();
  setActive(null);
  setPhase('idle');
  setTyped([]);
  setBuried(false);
  seqRef.current = 0;
}, [frameIdx]);
```

Remove the `Math.random()` initial index — a deterministic first frame is a better opening, and it makes the prerendered shell match the hydrated one.

- [ ] **Step 3: Add the control row**

Below the frame, using only the existing palette and `ESPER_EASE`:

```tsx
<div className="mt-4 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.3em] uppercase">
  <button
    onClick={() => goToFrame(frameIdx - 1)}
    aria-label="Previous frame"
    className="flex items-center gap-2 px-3 py-2 border border-[#1f1c17] text-[#00d4ff] hover:border-[#00d4ff] transition-colors"
  >
    <ChevronLeft size={14} /> prev
  </button>

  <div className="flex items-center gap-2" role="tablist" aria-label="Esper frames">
    {frames.map((f, i) => (
      <button
        key={f.photoId}
        role="tab"
        aria-selected={i === frameIdx}
        aria-label={`Frame ${i + 1}: ${f.caption || f.photoId}`}
        onClick={() => goToFrame(i)}
        className={`h-1.5 transition-all ${
          i === frameIdx ? 'w-6 bg-[#e040fb]' : 'w-1.5 bg-[#4a453e] hover:bg-[#00d4ff]'
        }`}
      />
    ))}
  </div>

  <button
    onClick={() => goToFrame(frameIdx + 1)}
    aria-label="Next frame"
    className="flex items-center gap-2 px-3 py-2 border border-[#1f1c17] text-[#00d4ff] hover:border-[#00d4ff] transition-colors"
  >
    next <ChevronRight size={14} />
  </button>
</div>
```

Import `ChevronLeft, ChevronRight` from `lucide-react`. Add the counter to the section header in HaikuDeck's format: `` `${String(frameIdx + 1).padStart(2, '0')}/${String(frames.length).padStart(2, '0')}` ``.

- [ ] **Step 4: Keyboard support**

Arrow keys move frames when the section has focus. The component has no keyboard handling at all today.

```ts
// Left/right step frames when focus is inside the section. Scoped to the
// section so it cannot hijack arrow keys for the rest of the page.
useEffect(() => {
  const el = sectionRef.current;
  if (!el) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToFrame(frameIdx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToFrame(frameIdx + 1); }
  };
  el.addEventListener('keydown', onKey);
  return () => el.removeEventListener('keydown', onKey);
}, [frameIdx, goToFrame]);
```

- [ ] **Step 5: Cross-fade between frames**

Wrap the image in `AnimatePresence mode="wait"` keyed on `frame.photoId`, matching HaikuDeck's `blur(6px)` enter/exit and using `ESPER_EASE`. The zoom rig stays as it is.

- [ ] **Step 6: Respect reduced motion**

`src/index.css:454-472` kills CSS animation for `prefers-reduced-motion`, but **framer-motion's JS transforms are untouched**, so today the 1.6s zoom runs at full length for those users. Other components in this repo already guard properly — `Hero.tsx:431`, `GhostUnits.tsx:21`, `MemoryDecay.tsx:30`. Do the same:

```ts
const reduced = useRef(
  typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
).current;
```

Use it to collapse the zoom and cross-fade durations to near-zero. The reveal prose still appears; only the movement goes.

- [ ] **Step 7: Verify in the browser**

```bash
pnpm build && pnpm dev
```

Walk it as a reader, not a developer:
1. Open a reveal, wait 30 seconds. **The frame must not change.** That is the whole point.
2. Click next through all 13 frames and back. No blank frames, no broken images.
3. Direct-jump via the dots.
4. Tab into the section, arrow left and right.
5. Turn on Reduce Motion in System Settings and reload. Zoom should be instant, prose still readable.
6. Confirm the four recovered frames render with images and prose.

- [ ] **Step 8: Commit**

```bash
git add src/components/EsperScene.tsx
git commit -m "feat(esper): manual carousel, replacing the 25s auto-advance

The frame advanced every 25 seconds and wiped all state with it, so a reader
partway through a reveal lost it. Now prev/next, direct-jump dots, arrow
keys, and a real reduced-motion guard — framer-motion's JS transforms were
ignoring the CSS-only kill switch in index.css."
```

---

### Task 4: Keep the buried line earned

Micah's decision: **only deliberate hotspot clicks advance the streak.** Next/prev must not satisfy it.

The streak lives at `EsperScene.tsx:49-51,110-114`. `run(h)` is called from two places — the hotspot rectangles on the image (`:220-223`) and the `node·NN` chips (`:356-359`).

**Files:**
- Modify: `src/components/EsperScene.tsx`

- [ ] **Step 1: Make the intent explicit in the signature**

```ts
/**
 * @param deliberate — true only when the reader chose this node themselves.
 *   The buried line is meant to be found, not handed over. Frame stepping and
 *   any future autoplay must pass false, or the payoff is free.
 */
const run = useCallback((h: EsperHotspot, deliberate = true) => {
  // ...
  if (deliberate) {
    const idx = orderedHotspots.findIndex((n) => n.id === h.id);
    if (idx === seqRef.current) seqRef.current += 1;
    else seqRef.current = idx === 0 ? 1 : 0;
  }
  const completesFrame =
    deliberate && orderedHotspots.length > 0 && seqRef.current === orderedHotspots.length;
  // ...
}, [orderedHotspots]);
```

Both existing call sites are deliberate reader choices, so both keep the default.

- [ ] **Step 2: Verify by hand**

1. On one frame, click all nodes in ascending order via the image rectangles. The buried block appears.
2. Reload. Click them out of order. It does not.
3. Reload. Step frames with next/prev repeatedly. It never appears.
4. Reload. Click all nodes in order via the `node·NN` chips. It appears — chips are a deliberate choice.

- [ ] **Step 3: Commit**

```bash
git add src/components/EsperScene.tsx
git commit -m "fix(esper): only deliberate node clicks unlock the buried line

Frame stepping must not advance the streak. The Chiclayo rooftop passage is
meant to be found."
```

---

### Task 5: Add more photographs

**Blocked on two prerequisites.** Do not start until both are cleared.

**Prerequisite A — an Unsplash API key exists.** There is none anywhere: `.env` holds only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and nothing Unsplash-related is in the Keychain or any other repo. Micah registers an application at `https://unsplash.com/oauth/applications` and the Access Key goes into the Keychain, never into `.env` or a source file.

**Prerequisite B — Micah picks the photographs.** These frames are his own work and the selection is editorial. The prose is written *to* each image. Do not auto-import a feed.

**Files:**
- Create: `scripts/esper-import-frame.mjs`
- Create: `supabase/migrations/<timestamp>_esper_new_frames.sql`

- [ ] **Step 1: List his photographs**

Write `scripts/esper-import-frame.mjs` to call `GET /users/micahboswell/photos` with `Authorization: Client-ID <key>`, printing id, description, dimensions and the `urls.regular` value for each. Read the key from the Keychain at run time:

```bash
security find-generic-password -s "unsplash" -a "micahboswell" -w
```

Do not hardcode it and do not echo it.

- [ ] **Step 2: Micah selects**

Present the list. He picks. For each chosen photograph he supplies a caption in the established register — lowercase, `case file #2049 · <subject>` — and, for portraits, an `object-position` value.

- [ ] **Step 3: Write the reveal prose**

**This is the part that matters and it is not a mechanical step.** Each frame needs three or four hotspots, each with `track_cmd`, `enhance_cmd`, and a `reveal`.

The `reveal` voice, from a frame he wrote himself:

> the road goes into the fog and the fog does not clear for the camera. you were taught the destination was the point. it was never the point. the walking was the point, and no one tells you that until the fog is most of what is left ahead.

Lowercase throughout. One image held to the end. A turn in the last sentence that reframes what came before. No resolution. If Micah is writing these himself, this step is his. If an agent drafts them, they are drafts for his review and are marked as such — his voice rules are in `~/CLAUDE.md` and they are strict: no em dashes, no "perhaps", no adjective stacking, no resolved endings.

- [ ] **Step 4: Place the hotspots**

`x`, `y`, `w`, `h` are normalized 0-1 against the image. Existing values run `w`/`h` around 0.2-0.3. Rectangles must not overlap or they become unclickable, and they should sit on something the `reveal` actually discusses.

- [ ] **Step 5: Write the migration**

One `INSERT` per hotspot, `order_index` in tens (10, 20, 30, 40), `photo_credit` matching the Task 1 value. Because Task 2 derives frames from the data, **no component change is needed** — this is the payoff.

- [ ] **Step 6: Verify**

Apply, reload, step to the new frames. Confirm image, caption, all hotspots clickable, prose rendering, and that clicking all nodes in order still unlocks the buried line.

- [ ] **Step 7: Attribution check before shipping**

Confirm what Unsplash's API guidelines require even for one's own photographs — in particular whether the download-tracking endpoint must be triggered, and whether hotlinking `images.unsplash.com` is permitted for this use. The component hotlinks today. Verify rather than assume.

- [ ] **Step 8: Commit**

```bash
git add scripts/esper-import-frame.mjs supabase/migrations
git commit -m "content(esper): add <n> frames from @micahboswell"
```

---

### Task 6: Record the carousel law in the spec

`docs/superpowers/specs/2026-07-06-esper-harmonize-ache-design.md` is where the esper design law lives. Append what this plan established, so the next agent does not re-derive it:

- The frame is manual. It never advances on its own. A reader mid-reveal is never interrupted.
- Frames come from `esper_hotspots`. A new frame is an INSERT; the component does not carry a frame list.
- The buried line is unlocked only by deliberate node clicks.
- Carousel chrome follows the existing law: cyan available, magenta active, `ESPER_EASE` for every transition.
- `@micahboswell` is the photographer credit.

- [ ] **Step 1: Append the section**
- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-07-06-esper-harmonize-ache-design.md
git commit -m "docs(esper): record the carousel law"
```

---

## Self-Review

**Spec coverage.** Manual carousel → Task 3. More pictures → Task 5. Prose preserved → Global Constraints, plus Task 2 Step 4 explicitly excludes `reveal` from the caption normalization. The three decisions Micah made are each implemented: handle in Task 1, streak scope in Task 4, data-driven frames in Task 2.

**Placeholders.** Task 5 is gated rather than filled because it depends on an API key that does not exist and on an editorial selection only Micah can make. Writing invented `reveal` prose into a plan would be worse than leaving the step honest.

**Type consistency.** `EsperFrame` and `buildFrames` are defined in Task 2 and used unchanged in Task 3. `run(h, deliberate)` in Task 4 keeps its existing single-argument call sites working via the default.

**Sequencing.** Tasks 1-4 ship independently of Task 5 and deliver the thing he asked for first: control of the frame, plus four frames of his prose that no visitor has ever been able to reach.
