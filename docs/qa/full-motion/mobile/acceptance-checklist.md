# Mobile acceptance checklist — intervention 9/10

Scope: final local production build at `http://127.0.0.1:4173`, private QA database, no mail, no submissions, no contact details or files. Source and assets are frozen during this pass.

Execution attribution: the mobile subagent could not access IAB. All eventual UI actions and captures are executed by the root agent in its IAB binding. This checklist and subsequent proof interpretation belong to the mobile subagent. An unavailable subagent browser is not a successful browser check.

## Minimal UI matrix for root

Use one own IAB tab at **390 × 844 CSS px**. Record its actual DPR separately; do not combine viewport emulation with conflicting raw device metrics.

- Record the initial draft offer and exact active choices before changing anything. Restore those selections at the end. Do not submit or populate a brief.
- From a listing, open and return from Vitrine, Connecté, Immersif 3D, Sur mesure, Évolution and Refonte. Check correct heading/destination and return route/position, no horizontal page overflow and a live header. Record actual animation timings or events when available. Paused screenshots only establish visual states.
- On Vitrine, compare a base/first choice/add/remove sequence. The card should grow smoothly on first choice and later additions, and collapse smoothly on removals; selected labels stay inside the card above the total. Multiple option groups must stay independently open. A closed group must retain its selected summary and hide its interactive rows accessibly.
- With all 12 Vitrine choices active, inspect the whole card and continuation seam, preferably with scroll-zero top proof plus lower card proof. Verify the top texture rectangle stays fixed at the same size/position when choices grow; all selected rows and total must remain reachable through ordinary page scrolling. No mobile inner scrolling or sticky card.
- Inspect Sur mesure after a long selection: same fixed upper geometry, organic continuation without an obvious repeated/mirrored seam, vivid matter and readable copy. Use actual DPR captures rather than screenshots rescaled for comparison.
- Change reduced-motion preference **after the source link has rendered**, then activate that existing link. Check route correctness and no native transition start or nontrivial option animation. Restore the preference after the check.
- Keyboard where practical: visibly focus Changer, dismiss its menu, activate an option with Space, open the blank brief using the mobile action, verify its heading receives focus, then return through Mes options and verify option selection is preserved. Never fill fields or submit.
- Optional one boundary check at 844 × 390 or a nearby tablet/desktop boundary if mobile sizing suggests a risk; avoid duplicating the desktop suite.

## Source expectations (not browser results)

- `project.css`: at ≤760px, `.configurator-card-column` is `position:static`, the grid has one column, the card has natural height, and the inner scrolling rule applies only at ≥761px. Upper texture height is fixed at **500px**, independent of option count.
- Upper source remains `grain-plasma-master.webp` **1536 × 1024** at high density, with the small source at DPR 1. Native continuation is **1536 × 2048**; custom uses its **1536 × 1024** upper crop. Source uses no reflected repeated bands for extension.
- `SelectedPlanCard.tsx`: options remain within `.selected-plan__content` and above the total. Stable rows expose only active selection via `aria-hidden`.
- `configurator/index.tsx`: the option accordion uses `type="multiple"`; closed content has `inert` and `aria-hidden`; heading focus/scroll is intentional on brief/options changes.
- Selection height and transform transitions are **620ms**, opacity **420ms**. Option accordion group unfolding has its separate **280ms** duration. These are specified durations, not a measurement of rendered performance.
- `plan-motion.css`: six journeys use **520ms** surface choreography. The header is outside the captured page, the transition overlay ignores pointer events, and incoming/outgoing surface images use `object-fit:none` to preserve their raster scale.
- `plan-transition.tsx`: the click handler re-evaluates reduced motion at activation time. Both native transition CSS and the global reduced-motion rule remove effective animation when reduced motion is active.

## Evidence standard

Store only relevant traces, screenshots and this report in `docs/qa/full-motion/mobile/`. Attribute observed pass/fail to the root-generated trace or screenshot. Explicitly separate actual unpaused timing/event measurements from paused visual inspections, and retain any unverified limitation.
