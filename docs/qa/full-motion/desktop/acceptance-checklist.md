# Desktop acceptance checklist

Source revision: working final build; commit pending.
Target: production Express build at http://127.0.0.1:4173; private QA data; no submissions or mail.

Agent 8 CUA limitation: `cua.createBrowserTab('iab', …)` returned `Browser is not available: iab`; inventory exposed Chrome only. Agent 8 opened no tabs and changed no browser state. Root owns the IAB execution; only root-supplied traces/screenshots may support passes below. This environment limitation itself is not a browser pass.

## Required journey matrix

- Homepage pricing cards: Vitrine → `/forfaits/vitrine`, Connecté → `/forfaits/connecte`, Immersif 3D → `/forfaits/immersif-3d`, Sur mesure → `/forfaits/sur-mesure`, Évolution → `/contact?besoin=evolution`, Refonte → `/contact?besoin=refonte`.
- For each, record listing scroll X/Y and clicked card viewport rect before click. Activate existing `Tous les forfaits` detail link; compare returned listing scroll and matching card rect before taking its native new snapshot. Confirm original listing path `/` and unaltered card position, allowing subpixel rounding only.
- Repeat one `/forfaits` card → detail → existing return. It must return `/forfaits` with original card/scroll, not homepage.
- Direct detail entry → existing return defaults to `/forfaits`.
- Évolution → Refonte (same `/contact` path, different `besoin`) selects the correct service title and current menu check without duplicate native names.
- Rapid Vitrine → home → Connecté interruption settles at Connecté, with no late replay or stuck motion.
- Header Forfaits can open during native motion; its six actual links are usable and visible. No screenshot overlay blocks the header/menu.
- Ordinary keyboard Enter follows the selected card link. Modified click, if supported in this IAB, preserves standard new-tab/link behavior and does not replace current route.
- Dirty brief: type dummy text; attempt navigation; choose `Rester sur le formulaire`; route/input remain. Later unrelated accepted navigation must not inherit cancelled preserveScroll or stale source geometry. Erase dummy text; never submit.

## Runtime evidence (normal motion)

Record actual `document.getAnimations()` entries while native pseudo-elements are active, including target/pseudoElement, animationName, playState, currentTime, computed timing and keyframes. Retain samples on both outgoing old page and incoming new page. CSS duration declarations alone cannot establish playback.

Native snapshots should distinguish `plan-page-outgoing` and `plan-page-incoming`, the chosen `plan-{variant}` surface, `plan-{variant}-content`, and thumbnail copy; text layers must avoid scale. Whole outgoing page fades/slides out while new content fades/slides in. Surface frame moves/resizes; original image rasters retain own size (`object-fit: none`). Header stays live.

Observe normal speed. One explicitly inspection-paused midpoint is allowed for evidence only; resume immediately and label capture inspection-paused. Settled screenshots must be at page scroll0; use viewport captures, not fullPage while scrolled, which can misplace sticky headers.

## Texture and layout probes

At DPR2 record upper `.selected-plan__texture:not(.selected-plan__texture--continuation)` rect and `getComputedStyle(texture, '::before')` backgroundImage, backgroundSize, backgroundPosition, transform, filter. Vitrine, Connecté, Immersif 3D, Sur mesure, Évolution and Refonte need their own computed transform. Immersif historically computes `none` because the legacy x variable is missing; custom computes `matrix(-1, 0, 0, -1, 0, 0)`. Do not normalize these into a changed appearance.

The upper original uses `grain-plasma-master.webp` in the DPR2 image-set (native1536×1024). With option expansion, texture rect top/height/transform stay fixed while lower canvas is revealed. Visual evidence should show sharp type/original and organic continuation, no repeated mirrored stripe. Check custom continuation seam specifically if visible. If screenshot covers only above seam, explicitly leave seam unverified.

Check detail card stays sticky on desktop; chosen options remain accessible through its internal content scroll when long. Do not change the real draft; preserve any starting selected-option IDs and restore them after dummy QA.

## Report boundaries

Report each acceptance as observed pass/fail or not exercised, with file evidence. Record viewport, DPR, motion preference, actual build URL/revision, console/runtime errors, and all limitations. Local production-build validation is not online production validation. Do not claim universal visual perfection or browser coverage.
