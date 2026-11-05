# Final source and invariant review

Read-only review of the current working change against `3d4d854`, including untracked helpers, motion CSS, four active texture exports and their provenance. Only this report was written. No browser, tests, build, commit, push or deployment was performed by this reviewer.

**Verdict: ready for publication.** No unresolved source blocker remains after the stale-intent and rapid-interruption patches; the final runtime retest passed and the parent reports the post-patch TypeScript, build and 213-test check passed. Deployment remains pending with the parent.

## Navigation repairs and review

- **Stale intent — repaired and re-read.** Intent now carries its source location key. Accepted outgoing capture consumes it with the accepted source key; nonanimated restoration compares the committed source key; every committed location clears remaining intent. Staying in `BriefNavigationGuard` explicitly discards it before resetting the blocker. Cancelled actions therefore cannot leave reusable preserve-scroll metadata. The guard's validation, submission and draft behavior are unchanged.
- **Rapid input patch — source and final runtime gate passed.** `plan-transition.tsx` now ref-counts capture listeners only while Router transition context is active and removes them when that context ends. Trusted physical pointer/keyboard input skips the current browser snapshot; stationary mouse over and zero-movement mouse events are excluded. There is no input prevention, coordinate remapping, synthetic activation, timer or route replay. A new programmatic/link navigation during an active context skips that snapshot and uses Router navigation without a competing native transition. Router still owns acceptance and blockers. Final root-generated evidence confirms immediate rapid navigation and an untouched full-duration transition.
- **Accepted endpoints.** Context must be active, endpoint keys distinct and the rendered location one of those endpoints. Service identity uses the exact `besoin` value, avoiding Evolution/Refonte pathname collisions. Only accepted outgoing context prepares return origin. Modified/non-primary clicks, non-self targets, downloads, document reloads and external string links keep their native path.

## Scope and privacy

Public offer changes navigate and return before configuration mutation; a refused departure does not change the selected configuration or listing origin. The new helpers retain ephemeral geometry/intent only. They add no browser storage, analytics, private-file fetch or outbound collection. Preload URLs are fixed local public texture paths.

`shared/`, `server/` and `src/lib/draft.ts` still match the base. Historical brief interpretation, pricing, private files, email delivery and persistent business rules are unchanged. The only common inquiry-component diff is clearing ephemeral motion intent on guard cancellation. Gallery filtering/external links and query-only scroll behavior retain their contracts.

`.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs` and `tests/sites-worker.test.mjs` also match the base. This is source preservation evidence, not a fresh package validation performed by this reviewer.

## Images and layout

All three protected originals match the base byte-for-byte. Their SHA-256 values are:

| Original | SHA-256 |
| --- | --- |
| `grain-plasma-master.webp` | `f7dc38f6e2309482bb66a2089e884d4f22f6d92f03f7f15fd323658630d00b76` |
| `grain-plasma-card.webp` | `bc85e2eb445c152ee2d740a17ad9f5fdf128ea1ed662b23f36c8621cc0569524` |
| `grain-plasma-detail.webp` | `b2178faf78f6d2b33834b893cee7ca61e8943a00d9ebf37a3dc2b830bb332d99` |

The four new export hashes match `vitrine-continuation-assembly.json`. Provenance documents native 1536px-wide generated continuation fields, transferred original high-frequency grain, lossless high-DPR exports and 768px-wide 1x exports. Generation/diagnostic files remain under `docs/asset-sources/`; four active exports are added under `public/`. The rejected portrait trial is preserved and no longer selected by the changed CSS.

The initial Immersif edge concern was withdrawn after cascade inspection. `SelectedPlanCard` lacks `.pricing-card` scale defaults, so the missing scale axis invalidates the legacy transform on non-custom variants. Only custom defines both axes and rotates; its upward continuation is appropriate. Root-supplied desktop evidence independently records `none` for the five other variants and the 180-degree matrix for custom. Do not normalize these variables into a changed approved image.

Source retains a bounded, focusable desktop inner scroll region, mobile document flow, multiple independently open option groups, immediate inert/aria-hidden closing contents and reduced-motion delay/duration overrides. The desktop report records all six native opening/return journeys, exact actual-source return scroll, fixed upper texture height, sticky/internal scroll and visible Vitrine/custom seams. Those are attributed browser findings, not this reviewer's own UI execution.

## Final release evidence

Reviewed the final root-generated local IAB artifacts: `mobile/final-normal-open.json` ends with no animations after uninterrupted native 520ms playback; `mobile/final-rapid.json` records 69 normal-motion frames and immediate home → Connecté → home navigation with a stable final home route. `mobile/final-keyboard-service-back.json` records Enter returning from Immersif while its native transition was active, exact Refonte query/title after switching from Evolution, browser Back to Evolution and an empty console. These close the final rapid-input release gate for the exercised browser.

The parent reports the post-patch `npm run check` passed TypeScript, build and all 213 tests. This reviewer independently rechecked `git diff --check`, which is clean, and made no application-source edits. Local validation and readiness for publication do not mean that publication has already happened.

GitHub Actions is separately blocked before job execution by the account billing lock documented in `ci-provenance.md`. No remote CI success or current production deployment is claimed here.
