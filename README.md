# My Flower Garden

A mobile-first digital flower garden: save the bouquets you've received, let AI identify
the flowers and their meanings, review and correct the results, and plant each bouquet
into a personal garden of memories.

This is a fully working prototype — every flow (add → identify → review → save → place →
revisit → edit → delete) runs end to end with real persistence, not a static mockup.

## Running it

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build (tsc -b && vite build)
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

Requires Node 18+.

## What's implemented (MVP "Must have")

- Bilingual UI: **Vietnamese (default)** and English, switchable anytime from
  Profile > Language, persisted across sessions. Covers all screens, the add-bouquet
  flow, and even the mock AI's flower names/meanings.
- Onboarding (3 screens, skippable, replayable from Profile)
- Home / **My Garden**: personal greeting, garden name, bouquet + species counters,
  a swipeable multi-area garden canvas with stable planting slots, empty state
- **Add a bouquet** flow: camera or library photo -> preview (retake/remove) -> AI
  identification with a soft loading state -> editable review of detected flowers
  (name, color, quantity, meaning, confidence, low-confidence warning, add/remove
  flowers) -> memory form (name, date, occasion, giver, note, favorite, overall
  meaning, **bouquet frame style**) -> garden placement (choose area/slot/vase/
  decoration, with conflict resolution — swap or move the existing bouquet to
  Collection — or skip for later) -> success feedback, with a direct **"Edit now"**
  shortcut into the bouquet's edit mode
- **Bouquet frames**: every bouquet photo renders inside one of six decorative
  frame shapes (kraft paper cone, ribbon round, classic arch, hexagon, heart,
  classic circle), chosen when saving and changeable anytime afterward. Used
  consistently across cards, quick view, garden slots, and the detail page.
- **Collection**: searchable, filterable (by occasion), sortable (newest/oldest) grid;
  shows placed/not-placed status
- **Favorites**: bouquets marked favorite
- **Bouquet detail**: botanical-journal-style view with edit (including **changing
  the photo and frame after saving**, not just text), move/place, favorite, delete
  (with confirmation)
- **Profile / Settings**: display name / garden name, **language switcher**, replay
  onboarding, reset all data
- Full state coverage per screen: loading, empty, error + retry, validation, low
  confidence, partial AI result, save failure, delete confirmation, camera
  permission denial with fallback, offline-safe local persistence
- Responsive from 375px-430px with no horizontal overflow, 44px+ touch targets,
  visible focus states, `prefers-reduced-motion` support, safe-area insets

Not built (per the brief's "Later" list, intentionally out of scope for this MVP):
public share links, AI-generated captions, anniversary reminders, most-common-flower
stats, seasonal themes, free-form drag-and-drop, premium tier.

## Architecture

```
src/
  i18n/
    translations.ts      Flat vi/en dictionary + translate()
    LanguageProvider.tsx  Context exposing t(), language, setLanguage (persisted)
  types/            Domain model (Bouquet, BouquetFlower, GardenArea, GardenPlacement...)
  lib/
    repository.ts   GardenRepository interface + localStorage implementation
    aiService.ts    FlowerAIService interface + bilingual mock implementation (Zod-validated)
    image.ts        Client-side validation + orientation-safe compression
    gardenLayout.ts Stable slot coordinates (not free drag-and-drop, by design)
  store/
    GardenProvider.tsx   Single source of truth; wraps the repository, exposes CRUD
  components/       Presentational + interactive pieces (20+), one concern each,
                     including BouquetFrame (renders the 6 frame shapes) and
                     FramePicker (the frame chooser used in the memory form)
  pages/            Route-level screens
  hooks/            useToast, useAddFlow (controls the add-bouquet overlay)
```

**Repository pattern.** All persistence goes through `GardenRepository`
(`src/lib/repository.ts`). Today it's `LocalStorageGardenRepository`. Business rules
are enforced there: a bouquet can have at most one active placement, deleting a
bouquet removes its flowers and placement (no orphans), placing into an occupied
slot returns a typed conflict instead of silently overwriting, IDs are stable UUIDs
(never array indices).

**AI service seam.** `src/lib/aiService.ts` defines `FlowerAIService` and a
`MockFlowerAIService` used for this demo. The mock is clearly isolated: it simulates
network latency, an ~12% failure rate (to exercise the retry/manual-entry UI), and
validates its own output against a Zod schema before returning it — the same schema
a real provider's response would need to satisfy. See "Going to production" below
for how to swap in a real vision provider without touching any component.

## Internationalization

`src/i18n/translations.ts` holds a flat key -> `{ vi, en }` dictionary; `LanguageProvider`
persists the choice to `localStorage` and exposes `t(key)`. Vietnamese is the default.
To add a new language: add a third locale field to each dictionary entry, extend the
`Language` union type, and add a button in Profile's language section — no other files
need to change. The mock AI service also takes a `language` option so demo flower
names/meanings match the UI language; a real provider integration should be prompted
to respond in that same language.

## Bouquet frames

`src/components/BouquetFrame.tsx` masks a bouquet photo into one of six CSS
`clip-path` shapes (kraft paper cone, ribbon round, classic arch, hexagon, heart,
classic circle) with small SVG decorations (ribbon, twine) layered on top. The style
is stored per-bouquet (`Bouquet.frameStyle`) and chosen via `FramePicker.tsx` in the
memory form during creation, or changed anytime from the bouquet's edit mode. Adding
a new frame shape means adding one entry to `FrameStyle`/`FRAME_STYLES` and one clip
path in `BouquetFrame.tsx`.

## Data model

Matches the brief's spec: `UserProfile`, `Bouquet`, `BouquetFlower`, `GardenArea`,
`GardenPlacement`. See `src/types/index.ts` for the full shapes and `AIRecognitionResult`
contract.

## Going to production

This demo intentionally keeps everything client-side so it runs anywhere with zero
setup. To take it further:

1. **Persistence -> Supabase.** Implement `GardenRepository` against Postgres tables
   mirroring the types in `src/types/index.ts`, and store `imageUrl` as a Supabase
   Storage path instead of a data URL. Swap the export at the bottom of
   `src/lib/repository.ts`.
2. **AI recognition -> a real vision provider.**
   - Add a server route, e.g. `POST /api/ai/identify-flowers`, that accepts a
     Storage path (never a raw image blob from the client), loads credentials from
     `process.env.FLOWER_AI_API_KEY` (or your provider's env var) **server-side
     only**, calls the provider with a JSON-schema-constrained prompt matching
     `AIRecognitionResultSchema` in `src/lib/aiService.ts`, and validates the
     response with that same schema before returning it.
   - Implement `RealFlowerAIService` against that route and swap the
     `flowerAIService` export.
   - Never call a vision provider directly from the browser with an API key.
3. **Auth.** `UserProfile.id` is currently a fixed `"local-user"`. Wire it to
   Supabase Auth's user id once accounts exist; the repository interface doesn't
   need to change.
4. **Bundle size.** The production bundle is ~157KB gzipped, mostly from
   `framer-motion` + `lucide-react`. Consider code-splitting the Add-bouquet flow
   with `React.lazy` if this grows.

Everything under "mock/demo" is isolated to `MockFlowerAIService` in `aiService.ts`
and `LocalStorageGardenRepository` in `repository.ts` — no mock logic leaks into
components, pages, or the store.

## Verification performed

- `npx tsc --noEmit` — passes, no errors
- `npm run lint` (oxlint) — 0 errors, 4 conventional warnings (context-provider
  fast-refresh notices, an async-load-on-mount effect) — no functional issues
- `npm run build` — production build succeeds
- Manual end-to-end testing via a real headless-Chromium session covering:
  - Onboarding -> skip -> empty Garden
  - Full add-bouquet happy path (photo -> AI identify -> review/edit -> memory form ->
    save -> place in garden -> success), with counters updating live
  - Data persistence across a full page reload (bouquet + placement both survived)
  - Collection search/filter, Favorites, bouquet detail, edit, favorite-toggle,
    delete-with-confirmation
  - Forced AI failure -> "Try again" (fails again, photo retained) -> "Add flowers
    manually" -> manual flower entry -> save, all without data loss
  - Camera permission denied -> clear explanation shown, "Choose from library"
    remains fully usable
  - No horizontal overflow at 375px, 390px, and 430px viewports; desktop centers a
    phone-width frame with no overflow

## Known limitations of this demo

- All data lives in `localStorage` on one device/browser — there is no account
  sync. This is called out in the Profile screen.
- The AI adapter is a deterministic mock (seeded by a hash of the image), not a
  real vision model — see "Going to production" above.
- No automated test suite (unit/e2e) is included; verification above was done
  manually via a scripted Playwright session during development.
