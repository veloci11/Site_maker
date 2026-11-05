# Performance and resource review — intervention 7/10

Reviewed locally on 2026-11-04. Read-only source and asset-metadata review; no browser, build, test, application edit, commit or deployment performed. This document is the only file written by this intervention. The parent owns final browser QA and integration.

## Conclusion

The current implementation preserves the requested native-quality direction: lossless high-density original and outpainting, fixed-height texture bands, bounded decorative noise, and native route transitions without a JavaScript animation loop or an image-load gate. Keep these high-quality sources. The best resource opportunities concern unused public exports and when intent preloads are issued, rather than reducing the approved image quality.

Runtime frame rate, image decode timing, native snapshot allocation and the visual seam remain unmeasured here. This is not a performance pass based on production traces.

## Measured asset metadata

Metadata below comes directly from WebP RIFF chunk headers and exact local file sizes. `VP8L` confirms lossless WebP encoding; `VP8` is lossy. It does not establish the quality or resolution of any earlier generation step.

| Asset under `public/assets/textures/` | Dimensions | Bytes | Encoding | Approximate decoded RGBA size |
| --- | --- | ---: | --- | ---: |
| `grain-plasma-master.webp` | 1536×1024 | 2,636,656 | lossless | 6 MiB |
| `grain-plasma-card.webp` | 768×512 | 162,744 | lossy | 1.5 MiB |
| `grain-plasma-vitrine-continuation.webp` | 1536×2048 | 4,556,058 | lossless | 12 MiB |
| `grain-plasma-vitrine-continuation-1x.webp` | 768×1024 | 434,368 | lossy | 3 MiB |
| `grain-plasma-vitrine-continuation-top.webp` | 1536×1024 | 2,431,116 | lossless | 6 MiB |
| `grain-plasma-vitrine-continuation-top-1x.webp` | 768×512 | 175,750 | lossy | 1.5 MiB |
| `card-grain.webp` | 256×256 | 107,058 | lossless | 0.25 MiB |
| `grain-plasma-detail.webp` | 1536×1024 | 879,898 | lossy | 6 MiB |
| `grain-plasma-vitrine-trial.webp` | 724×2172 | 433,004 | lossy | approximately 6 MiB |

Decoded size is width × height × four bytes, an estimate of one RGBA representation, not a measured browser memory allocation. Browsers may retain compressed data, additional copies and filter/compositing surfaces.

The native lower extension is twice the height of the original at the same width. The custom extension has the original dimensions. Their 1x derivatives have exactly half the dimensions in each direction. This matches the fixed-scale band geometry. Native files should remain the high-density sources.

## Confirmed source behavior

- `SelectedPlanCard.tsx` renders one original band and one continuation band. `project.css` fixes their heights through `--plan-texture-height` (580, 530, 540 or 500 CSS px by breakpoint); selecting options does not change these dimensions or `background-size`. The ordinary continuation is twice the band height; custom uses one band height. No option-dependent image resize, new canvas export, repeating band or extra reflection was found. Static variant transforms remain, including vertical flips on approved color variants; natural seam quality requires visual inspection.
- The master, card and continuation image URLs are static. The high-density master and continuations use `image-set`; `preloadPlanImages` selects the matching native or 1x URLs using DPR > 1. No JavaScript pixel processing is involved in the selected card.
- Hue/saturation filters are static. Small-card grain animates once for 360 ms on hover/focus, then stops. `AmbientGrain` paints once at DPR 1 and again only after a debounced width change; it has no animation loop. Its 1180 px backing height is fixed. No animated noise/filter loop or scroll-frame React listener was found in the reviewed path.
- Desktop selected-card height is capped to `100dvh - 180px`; only its content scrolls. Mobile remains in document flow. Option rows use CSS grid/opacity/translation transitions. Grid-height animation requires layout work, but it does not recalculate texture size and has no per-frame React update.
- `plan-transition.tsx`, `motion.tsx` and `plan-motion.css` are present. React Router owns native transition start/cancellation. Geometry is read in layout effects on accepted outgoing/incoming navigation, not continuously. No growing snapshot array, cloned image cache, pending animation callback queue, `setInterval` or permanent `will-change` was found.
- The root has `view-transition-name:none`; only participating page/footer, selected surface and copy layers are named. Surface snapshots use `object-fit:none`; the animated frame reveals their native scale. The overall 520 ms animation is finite. Reduced motion disables both entry and transition animations.
- The configurator route is resolved using the router's `lazy` route function before committing the destination. Card pointer/focus intent starts its import without awaiting it. The configurator imports the brief statically, so its dependency graph resolves with that module. The service routes reuse the public module already loaded for the listing. This avoids a deliberate loading-screen capture and an extra brief-module fetch at the creation-page commit; actual chunk sizes and request order were not measured.

## Targeted observations and recommendations

### 1. Retire unused public exports from deployment output

`grain-plasma-detail.webp` and `grain-plasma-vitrine-trial.webp` have no references in the searched `src`, `index.html`, `scripts` or Vite configuration. Together they occupy **1,312,902 bytes** (1.252 MiB). Vite is configured with its default public-directory behavior, so these are expected to be copied into deployment output despite being unused by the current UI. No current build was inspected.

Move preserved originals/experiments to `docs/asset-sources` after the parent confirms there are no external consumers. This preserves the supplied files and quality while reducing output size. It does not imply those files are downloaded during a normal visit.

### 2. Intent preloads are nonblocking, but can request a currently invisible continuation

`PricingCard` invokes the helper only on pointer entry or focus; it does not warm all six offers during mount. React DOM receives identical image URLs on repeated calls and is expected to deduplicate identical preload resources; no distinct URL/query-string duplication exists in source. No runtime network trace was taken to confirm reuse across preload and CSS fetches.

Every card intent still requests the continuation even on desktop, where the selected card's capped outer surface may never reveal the lower band. This is a potential **4.56 MB native lower-extension** or **2.43 MB custom-extension** speculative request, despite the intentional low fetch priority. Consider making continuation warming dependent on the mobile/in-flow layout, or visible surface need, while retaining the native URL when needed. This changes request timing only. It should never block the click or lower image quality.

The original band's CSS explicitly has a second background layer using `grain-plasma-card.webp`, including at high DPR. A high-density visit may therefore fetch both the card and master. This appears to be the deliberate lightweight fallback, not a duplicate request for the same file. Keep it unless browser evidence shows a better equivalent fallback.

`devicePixelRatio > 1` is a reasonable intent heuristic but is not necessarily identical to browser `image-set` selection under data-saving policies or a display/DPR change. Treat exact preload/candidate matching as a browser check, not an established no-overfetch guarantee.

### 3. Check cold header and custom-switch journeys for an image decode race

Only the small `PricingCard` component currently calls `preloadPlanImages`. Header links, the comparison actions and the selected-card switch menu do not issue that image warmup. Their route module can resolve before a cold master/continuation has downloaded and decoded. Native capture may consequently precede final texture pixels; this is an inference, not an observed blank frame.

During final QA, inspect cold-cache entry through those paths, including the first custom visit, plus touch where hover provides no lead time. If visible, share the existing nonblocking pointer/focus intent helper with those triggers. Do not add an awaited image gate, fixed delay or replace the native source with a smaller source to hide the race.

### 4. Native snapshots have no explicit application memory budget

The implementation stores only two small geometry records, so no JavaScript snapshot-retention leak is evident. Desktop card geometry is bounded. However, the named `.motion-page` covers a potentially long listing or mobile configurator, and the parent/footer/surface/copy captures produce multiple simultaneous native layers. Browsers may clip or cap these; source inspection cannot establish their allocation.

For scale only, two full 1440×900 RGBA viewport captures at DPR 2 would total approximately **39.6 MiB**, before extra named surfaces, decoded textures and compositing. This is arithmetic, not a measured allocation or a claim that the browser captures the complete page. The native master plus ordinary continuation alone represents approximately **18 MiB** decoded; existing card/fallback and custom sources can remain cached as well.

The final browser check should include a long mobile selected-options card, a far-scrolled listing return and rapid interrupted switches, and inspect capture rectangles/frame stability. If it demonstrates excessive snapshot dimensions or jank, narrow the page-body capture bounds/layers while retaining native surface/copy fidelity. No blanket image downsampling or speculative DOM restructuring is justified by this static review.

## Parent QA still required

Confirm all six opening/return/switch journeys at native DPR, with cold and warm assets; verify no initial missing texture, fixed grain scale during options changes, a natural lower seam and custom seam, smooth internal scrolling, interruption cleanup, and reduced motion. Record actual snapshot rectangles and network reuse if the browser tools expose them. Visual quality and frame-time conclusions await those observations.
