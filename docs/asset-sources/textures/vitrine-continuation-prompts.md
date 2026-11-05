# Vitrine continuation — 2026-11-04

Built with the built-in `image_gen` tool. No CLI/API fallback. All selected generated panels are native 1536×1024; none is enlarged. The 724×2172 portrait trial is not used.

## Source preservation and geometry

The existing master, card and detail files are untouched. The original master remains a separate fixed upper tile. The downward extension adds 2048 source pixels (2× original natural height); the upward extension adds 1024 (1× original natural height). At an image width W, those heights are 4W/3 and 2W/3 respectively.

The upward asset is naturally oriented with far-above content at its top and the original TOP edge adjoining its bottom. Apply the existing custom 180° rotation to both the original and this upward asset.

## Assembly

Run `node docs/asset-sources/textures/assemble-vitrine-continuation.cjs` from the repository root.

The three selected downward panels each contain a regenerated 256px edge anchor. Those anchors are discarded: only 768px of newly generated content from each is appended, then the result is cropped from 2304 to 2048px. Low-frequency color differences at each join are corrected within 192 source pixels, without changing the original.

Imagegen supplied all new large/medium color currents. Its native microtexture tended toward curls rather than the source's photographic speckle. The final composites therefore transfer the ORIGINAL RGB high-frequency residual (source minus Gaussian blur sigma4) over the generated native color field. Small 32px residual patches are selected by matching underlying local tone, in irregular order. Source color blobs are excluded by high-pass separation. There is no mirroring, source macro-form reuse, added procedural grain, enlargement, or sharpening of the rejected portrait.

High-DPR exports are lossless WebP because a quality97 export visibly dulled colored grain in 1:1 comparisons. The 1x exports are downscaled to 768px wide and compressed at quality95. Only four final exports ship in public; generation source files and diagnostics remain under docs.

## Quality review and limits

The upper image remains literally original. The added color flow is generated content, so it is not claimed to be a recovered original. The source residual is reused at microscopic scale; it is not globally unique stochastic noise. No recognizable repeated/reflected macro-shape is introduced.

The downward join requires modest maximum channel corrections (19/255 at original join, 14/255 and9/255 internally). The upward model did not place the central burgundy edge accurately and needed a stronger correction (maximum175/255 over its last192 pixels). Review this custom seam at the actual rendered scale/DPR; the source image itself is not altered.

Native inspection images: `vitrine-continuation-seam-100-percent.png`, `vitrine-continuation-complete-preview.png`, `vitrine-upward-complete-preview.png`. Final dimensions, byte sizes and hashes are in `vitrine-continuation-assembly.json`.

## Prompts

### Rejected first direct continuation (native 1536×1024, grain too curled)

```text
Use case: compositing.
Asset type: high resolution abstract grain texture extension for a website card.
Input image 1 is the reference and edge anchor, not an image to reproduce. Create ONLY a new landscape panel that continues DOWNWARD from the bottom edge of input image 1, as though it were the next part of the same much taller photograph of illuminated colored grain. Output exactly 1536 by 1024 pixels, landscape 3:2. Use the full native resolution for real fine detail.
The top edge of the new panel must match the reference BOTTOM edge, column by column in color: dark burnt red/burgundy on far left, glowing deep orange/copper across left-center and center, vermilion and red toward the right, burgundy at far right. Carry these large soft organic currents naturally downward into richer flowing copper/orange, scarlet and deep wine. New distinct asymmetric motion; no recognizable repetition of the reference, no vertical or horizontal reflection, no symmetry. Do not introduce another blue/cobalt patch: the new panel is entirely the WARM lower continuation.
Medium: dense, sharply resolved, evenly distributed very fine photographic film/digital grain, subtle granular roughness, exactly the same grain frequency and density as reference, individual tiny noise particles visible at native resolution across ALL areas including dark red areas. Color currents are soft but the grain itself is crisp, not painterly blobs, not smooth gradients, not blurry, no plasticky noise patches.
No borders, no horizontal stripe, no straight seam, no text, no watermark, no objects. Match the original contrast and saturation without neon yellow. This is one connected, non-repeating field, not a tile.
```

### Rejected grain-only correction (not selected)

```text
Use case: style-transfer.
Asset type: native resolution abstract texture, landscape 1536x1024.
Input image 1 is the ORIGINAL source and the exact microtexture STYLE reference. Input image 2 is the selected new continuation panel, the EDIT TARGET.
Change only the microtexture of image 2 to match image 1. Keep image 2's existing large color currents, palette, composition, lighting and overall tonal flow. Make a full native 1536×1024 landscape image with real resolved detail.
CRITICAL: the selected extension currently has undesired thin winding worms/veins/curlicues at fine scale. REMOVE those. Match the original's very dense, tiny, randomly scattered photographic noise particles: pointillist stippled rough fine photographic film grain. Independent sharp microscopic flecks, visually stochastic white-noise-like granules about 1 pixel to 2 pixels, with no drawn strokes, no connected lines, no squiggles, no ridge texture, no cracked pattern, no cellular pattern, no visible repeating noise. Preserve the soft organic large color cloud forms underneath. Crisp uniform tiny grain in every dark and light part, without blurring the color boundaries or inventing new shapes.
No text, watermark, borders, symmetric forms, new blue patch or recognizable reflection. Saturated burnt orange, copper, red, burgundy throughout.
```

### Selected outpaint panel1

```text
Outpaint the provided 1536×1024 landscape texture canvas downward. Its upper 256 pixels are the exact source texture; the remaining lower 768 pixels are empty and need entirely new content. Keep the upper strip and continue the SAME photographic grain texture and soft warm red/orange/copper currents through the empty area, as one continuous image. Output native landscape 1536×1024 opaque pixels, without resizing or stretching the source.
This is finely stippled photographic grain, NOT veiny, wrinkly, wavy, cellular or drawn-line texture. Match the exact tiny independent speckles in the provided strip. Make the speckle detail just as dense and sharp as the source strip, no blur or smooth areas. Warm amber, orange, copper, vermilion, burgundy currents must evolve into new natural asymmetric currents down the panel; no mirroring, no repeated pattern and no blue blob. No text. No watermark. No visible straight horizontal boundary where the upper strip ends.
```

### Selected outpaint panel2

```text
Use case: compositing. Outpaint the provided landscape texture canvas at native 1536×1024 pixels. The upper 256px strip is the existing edge anchor. Fill all of the empty lower 768px area with a natural new downward continuation of that exact warm abstract photographic grain field. Keep the strip's grain frequency and color edge continuity; no straight boundary. Real crisp dense tiny independent photographic noise flecks, about one to two pixels, across the entire image. Do not turn grain into drawn wavy lines, veins, wrinkles, cells, cracked patterns or smooth blur.
Allow the warm red/copper/orange/wine color current to develop into a new asymmetric softly curving current toward the lower left, with dark wine shadows subtly flowing around it. Match original saturation and contrast. Avoid neon yellow or blue. No reflection, symmetry, recognizable repeated shapes, tiled patterns, text, watermark or objects. Full native 1536 by 1024 opaque output, landscape.
```

### Selected outpaint panel3

```text
Use case: compositing. Outpaint this 1536×1024 landscape abstract texture. The upper 256px strip is the source edge; fill the empty lower 768px area, seamlessly continuing DOWNWARD. Keep upper strip's exact warm coloring and fine grain style. Output native 1536×1024 landscape opaque image.
Let the orange/copper river on left subtly arc toward center in the lower half and dissolve into textured vermilion and dark burgundy toward the bottom/right, with an organic asymmetric natural flow. Match the original dense very tiny independent photographic noise stipple, about one or two pixels; all details crisp at full resolution. Every region must have the same fine grain density. Avoid connected worms, drawn wavy lines, veins, wrinkles, cells and plastic blur. No smooth gradient without grain.
Absolutely no blue areas, mirror/reflection/symmetry, recognizable repeated shapes, tiling, straight horizontal boundaries, text, watermark or objects. This is a continuation of one fine grained abstract field.
```

### Selected upward continuation

```text
Use case: compositing.
Asset type: native 1536×1024 landscape abstract grain texture continuation.
The input is a reference image. Generate ONLY the new panel that would sit immediately ABOVE it, as if revealing the area just above this photo of an abstract grain field. Do not reproduce the reference. The BOTTOM edge of your new image must continue naturally into the reference TOP edge, matching column positions: intense cobalt/ultramarine blue at far left and left-center, a restrained burgundy/oxblood transition near center, very dark navy and almost-black blue toward the right. The image is oriented naturally, with the part farthest above at its top.
Create a NEW flowing asymmetric field of dark navy/cobalt, electric blue and subtle deep burgundy shadows, gracefully flowing down toward those bottom edge colors. Avoid a recognizable copy of the reference's single large blue blob or orange river. No new large bright orange blob. No mirror, no reflection, no rotational symmetry, no repeated shapes, no tiling and no horizontal seam.
Style: dense extremely fine, sharply resolved photographic film grain across the entire field, same frequency and density as the reference, tiny independent random 1–2 pixel flecks, not connected curls/worms/veins or drawn strokes. The large color currents are softly organic, the microtexture is crisp. Full native 1536 by 1024 resolution landscape, opaque. No text, objects, borders or watermark.
```

