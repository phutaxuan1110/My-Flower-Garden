# Patch notes — Garden Edit Mode / Garden frame / Onboarding fixes

## How to apply
1. Copy every file in this ZIP over the corresponding path in your repo (paths are repo-relative, same layout as `My-Flower-Garden-main/`).
2. **Delete `src/components/GardenEditToolbar.tsx` from your repo.** It's been replaced by `src/components/GardenEditActions.tsx` (included here) and is no longer imported anywhere. A ZIP can't express a deletion, so this step must be done manually.
3. Re-run `npm run build` (or `npm run dev`) as usual — no new dependencies, no schema/data migration needed.

## Files in this patch
- `src/components/MobileAppShell.tsx` — modified
- `src/components/GardenEditActions.tsx` — **new** (replaces `GardenEditToolbar.tsx`)
- `src/components/GardenEditView.tsx` — modified
- `src/components/GardenSlot.tsx` — modified
- `src/components/GardenEditCanvas.tsx` — modified
- `src/pages/GardenPage.tsx` — modified
- `src/pages/OnboardingPage.tsx` — modified
- `src/i18n/translations.ts` — modified
- `src/index.css` — modified

## Not included (delete manually)
- `src/components/GardenEditToolbar.tsx` — removed, no longer used.

See the chat response for the full root-cause explanation, before/after verification, and known limitations.
