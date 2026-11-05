# Mobile review — intervention 9/10

**Local mobile release gate clear.** Root corrected lost clicks during an active native transition and retested the final built client `index-CRL_a74v.js`. This report covers local IAB verification; it does not claim deployment or production verification.

UI actions, browser probes and screenshots were executed by the root agent in its IAB binding against the local production build on port 4173. The mobile subagent reviewed the saved JSON, screenshots and relevant source; it did not operate a second browser or submit forms. `viewport.json` confirms the requested and actual inner viewport **390 × 844 CSS px, DPR 1**. The document client width is 375px after the 15px scrollbar; its 335px card plus two 20px margins is consistent with that client width.

## Observed results

| Journey | Open destination | Return destination | Detail layout |
| --- | --- | --- | --- |
| Vitrine | `/forfaits/vitrine` | `/` | static aside, no horizontal overflow |
| Connecté | `/forfaits/connecte` | `/` | static aside, no horizontal overflow |
| Immersif 3D | `/forfaits/immersif-3d` | `/` | static aside, no horizontal overflow |
| Sur mesure | `/forfaits/sur-mesure` | `/` | static aside, no horizontal overflow |
| Évolution | `/contact?besoin=evolution` | `/` | static aside, no horizontal overflow |
| Refonte | `/contact?besoin=refonte` | `/` | static aside, no horizontal overflow |

`journeys.json` and the twelve `*-open.json`/`*-close.json` traces record native surface, content and page layers in both directions. Their surface animations report 520ms. Opening resets scroll to zero; returns end at the respective home-card area (436, 861, 1286.5, 1708.5, 2144 and 2568px). Native-transition samples span approximately 516–541ms, with the entire click/setup/animation recordings finishing in 636–653ms. These are unpaused runtime samples, not timing inferred from screenshots, and do not establish a hardware frame-rate guarantee.

`option-add-frames.json` and `option-remove-frames.json` show gradual card height changes **843.258 → 872.758px** and back, with actual 620ms grid/transform transitions and 420ms opacity transitions. Animations are first recorded at about 37ms and absent by 656/659ms, including click/setup overhead. The upper texture remains **335 × 500px** in every sample. Its screen Y changes when the browser scrolls the page; it stays aligned with the card top. These traces cover a later addition/removal (11 ↔ 12 choices), not a first 0 → 1 selection.

`all-options.json` records 12 active Vitrine options, five independently open configurator groups, no horizontal overflow, and card-content client height equal to scroll height (825px), with `overflow:visible`. This supports ordinary page flow and no forced inner scrolling on mobile. The Vitrine card grows to 872.758px. `custom.json` records 10 active custom options, a natural 835.453px card, a fixed 500px top texture and no horizontal overflow.

The full-page `vitrine-all-options.jpg` and `custom-all-options.jpg` show selected labels inside their cards above the totals, vivid color and no obvious repeated/reflected band or hard continuation seam. The fixed mobile action bar crosses a portion of the card in these full-page captures; that is a viewport overlay and does not establish inaccessible rows. Runtime card-content geometry shows no inner clipping, but a separate lower-card viewport proof is preferable for all-row reachability. At DPR 1 these screenshots verify the 1× image path. The companion desktop proof `../desktop/dpr2-direct-entry.json` records DPR 2 and downloads of the native master (2,636,956 transferred bytes) and custom top continuation (2,431,416 transferred bytes). That supports live high-density resource selection on desktop, not a DPR 2 mobile capture.

`reduced-motion.json` and `reduced-open.json` follow a preference change made after the source link rendered. The route reaches Vitrine, reduced motion is true, and only 0.01ms durations appear; no native view-transition pseudo-layer is recorded. This verifies the dynamic preference path for that activation.

`guard-keyboard.json` records Vitrine, three selected options and the exact temporary, non-personal test text after root activated the navigation guard's Rester action with Enter. It supports guard cancellation preserving an in-memory answer. The saved focus string contains the page body rather than an independently identified heading, so it is not proof of brief-heading focus. Root reports clearing the test text through the UI and returning to options afterward; no form was submitted.

The corrected-build `final-normal-open.json` contains 69 unpaused samples through 581ms, retains the full native body/surface/content choreography and reports a 520ms surface animation. `final-rapid.json` records home → Connecté → home → home with the latest destination stable after root's real pointer interactions during the previous snapshot. `final-keyboard-service-back.json` independently records an active transition on Immersif before Enter returns to home, correct Évolution → Refonte query/title selection, browser Back restoring Évolution, and an empty console result. These clear the rapid-navigation regression found during this pass. The fix skips the active native snapshot on real interaction; it does not synthesize or remap clicks.

Root also reports the final configuration restored to the original three-choice count and the temporary answer empty. The original intended choices were Français + anglais, Prise de rendez-vous and Maintenance du site. Exact restored active IDs are not independently listed in this mobile evidence set. Parent reports the post-patch check passing all 213 tests, TypeScript and production build; the mobile subagent did not rerun that suite.

## Scope limits

- The closed-group runtime probe used the wrong selector and returned an empty list. Source has `inert`/`aria-hidden` for closed content, but this is not a successful runtime accessibility check.
- First-selection growth (0 → 1), independent brief-heading focus, exact final draft restoration and a landscape/boundary check are not established by these mobile files. The guard test records only the count of three options; it does not independently list their active IDs. Do not infer those results from the normal journey matrix.
- Screenshot interpretation is a settled visual inspection. No paused screenshot is being used to claim actual animation duration.

The acceptance checklist and source expectations are in `acceptance-checklist.md`.
