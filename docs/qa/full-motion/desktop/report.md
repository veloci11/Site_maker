# Desktop motion review

Source revision: **working final build; commit pending**. Target is the local production Express build at `http://127.0.0.1:4173`, with private QA data and no form submission/mail. Root operated the integrated browser; agent 8 independently interpreted the saved traces and screenshots.

Agent 8's CUA could not create an IAB tab (`Browser is not available: iab`; only Chrome appeared in its inventory). Agent 8 did not use Chrome, open tabs, or change viewport, preferences, drafts or source. This access failure is a tool limitation, not a successful browser test. Root supplied the IAB evidence below.

## Six homepage journeys

`journeys.json`, each `{variant}-open.json` and `{variant}-close.json`, and the derived `journey-trace-analysis.json` establish the following:

| Card | Exact detail route | Upper original transform | Native open/close | Return scroll at first native incoming snapshot and at rest |
| --- | --- | --- | --- | --- |
| Vitrine | `/forfaits/vitrine` | `none` | Observed | 412.5 / 412.5 px |
| Connecté | `/forfaits/connecte` | `none` | Observed | 412.5 / 412.5 px |
| Immersif 3D | `/forfaits/immersif-3d` | `none` | Observed | 412.5 / 412.5 px |
| Sur mesure | `/forfaits/sur-mesure` | `matrix(-1, 0, 0, -1, 0, 0)` | Observed | 412.5 / 412.5 px |
| Évolution | `/contact?besoin=evolution` | `none` | Observed | 847.5 / 847.5 px |
| Refonte | `/contact?besoin=refonte` | `none` | Observed | 847.5 / 847.5 px |

All six final routes/titles match the intended card, all six detail overflow probes are false, and all six original texture heights are 580 px. All twelve journeys contain actual native pseudo-element animations and settle without active animations. Surface native group duration reaches 520 ms. Distinct old/new page fade and slide animations, the shared surface group, and separate content/thumbnail copy travel are present. This establishes actual runtime choreography, beyond CSS duration declarations.

The raw `returnDelta` of roughly 159–162 px in `journeys.json` compares against an observation **before locator click auto-scroll**. The last source-path trace samples show the browser had already scrolled to 412.5 / 847.5 px before accepted navigation. Every return restores exactly those actual source scroll values, including the first frame containing native pseudo animations. A short incoming-path sample at scroll0 precedes native pseudo creation; it does not show a wrong native snapshot. Card viewport rectangles were not retained at accepted source capture, so the first batch independently establishes scroll restoration rather than exact per-card geometry.

Example: `vitrine-opening-frames.json` has 74 samples, including 65 native-animation samples from t115 to t664 ms. At t397 ms the surface group is at approximately 48% progress while the old page exits, new page enters, and sharp copy uses separate layers. At t672 ms the route is `/forfaits/vitrine`, scroll0, with no remaining animations.

## Options, texture, sticky card

`option-add-frames.json` contains 98 samples. It records live grid and transform transitions at 620 ms and opacity at 420 ms. The upper texture remains 580 px throughout while card height grows from about 707 to its 720 px desktop cap. This supports a fixed upper texture rather than stretching it with option content.

`options-sticky.json` records twelve selected controls, card inner scrollHeight909 versus clientHeight656, multiple open option groups, no horizontal page overflow, and a controlled sticky sample at window scroll720 with card top112 px. Its separate earlier card rectangle at y−69 reflects a different automation/scroll moment; it is not the controlled sticky measurement.

`vitrine.png` and `all-options.png` show crisp headings, readable selected labels and the original textured upper surface. The Vitrine continuation visible below the 580 px boundary has no obvious hard seam or repeated mirrored stripe in these static captures. This is limited visual inspection of the shown region, not proof that every pixel or variant is seamless. `custom.png` also shows the original and continuation without an obvious hard horizontal strip through the visible boundary. No mirror repetition is evident in that static region. This does not establish pixel-perfect seams at every height or density.

## Listing return, cancellation and internal scroll

`comparison-open.json` and `comparison-close.json` contain 64 and 63 actual native pseudo-animation samples respectively. The selected comparison CTA opens Connecté and its existing return reaches `/forfaits`. `comparison.json` confirms the return href `/forfaits`. Its `native:false` flags use a predicate requiring a UA *paired surface group*. This is a comparison CTA with no source card surface, so there is no such paired group; actual page/content native choreography still runs. Exact nonzero listing scroll/card geometry was not retained for this CTA case (the final listing sample is scroll0).

`guard.json` records that choosing Rester leaves the route `/forfaits/vitrine`, title Vitrine and thirteen option controls selected. It also records independent inner card scroll253 while page scroll remains0, confirming the long card content can scroll without moving the page. The artifact does not retain a dummy input value; input preservation itself is therefore not independently established by this JSON.

`after-cancel-close.json` contains sixty native samples after the cancelled navigation. The accepted existing return reaches homepage scroll412.5 and ends idle, matching the earlier actual homepage source. This supports correct subsequent return handling after cancellation. It does not by itself establish every possible cancelled preserveScroll sequence.

`option-remove-frames.json` adds 98 samples with genuine removal transitions (grid/transform620 ms, opacity420 ms). Upper texture remains580 px, while content scrollHeight decreases909→879 and finishes without animations. This complements the addition trace.

## Boundaries and outcome

The retained desktop matrix supports all six exact homepage details, native whole-page exit/entry and separately named card copy, native return choreography with exact actual-source scroll restoration, fixed upper texture height through addition/removal, long-card internal scroll and sticky placement. No horizontal overflow was reported in the six detail probes or expanded-options probe. Root reports no console warning/error during its desktop pass; agent 8 did not have the browser console directly.

Root inspected captures at scroll0. The files named `.png` are JPEG bytes from the integrated browser (Vitrine1425×1395, expanded options1425×2238, custom1425×1309), and render correctly. Their encoded dimensions are not viewport/DPR evidence. The saved desktop proofs do not establish DPR2 resource selection or native1536 image decode by themselves. Static captures show sharp type and grain, with no obvious Vitrine/custom continuation strip in the visible region, not a universal pixel-perfect guarantee.

Direct-entry fallback, same-path Évolution↔Refonte switching, rapid interruption, header menu during motion, ordinary Enter, modified click, exact dummy-value preservation, and final browser/draft restoration were not independently recorded in this desktop proof batch. Root may cover them separately; they are not silently counted as passes here. Agent 8 never touched the draft or browser preferences. No inspection-paused screenshot was used in this review. No source changes, build, commit, mail, deployment or online production acceptance were performed by agent 8.
