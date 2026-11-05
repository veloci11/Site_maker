# Intervention 6 — accessibility, reduced motion and overflow

Date: 2026-11-04. Review is **code-only**. No browser, screenshots, contrast measurements, tests, build, source edits, commits or deployment were performed. Assets were not changed. This records the in-progress integration as inspected; the parent owns final visual and interaction verification.

## Findings resolved during integration

### 1. Remove delays as well as durations under reduced motion

`src/styles.css:550` already resets the native view-transition old/new/group/image-pair animation durations **and delays** to zero. `canAnimatePlanNavigation()` also checks the current media preference at click time (`src/components/layout/plan-transition.tsx:11`). These cover the native snapshots correctly.

The initial review found the generic element/pseudo-element reduction only reset animation/transition duration. Root has now added `animation-delay:0s !important` and `transition-delay:0s !important` at `src/styles.css:554`; confirmed by reading the updated code. This also covers a preference change during a delayed DOM entrance. The explicit native pseudo-element override remains, since ordinary `*::before/*::after` selectors do not cover native transition pseudo-elements.

Status: resolved in code by root; browser verification remains with the parent.

### 2. Exclude closing accordion controls immediately during the exit

The selected-summary rows are correctly excluded immediately with `aria-hidden={!active}` (`src/pages/configurator/index.tsx:310`), and the empty summary and inactive monthly total are similarly hidden. Those nodes contain only text/decorative icons, so they need no additional keyboard guard.

The initial review found the shared Accordion wrapper did not immediately exclude closing option content. The installed Radix collapsible retains its children with `hidden=false` while the exit animation is present (`node_modules/@radix-ui/react-collapsible/dist/index.mjs:97,129`), which left a brief keyboard-access window during the 280 ms option exit.

Root has now made the configurator's multiple Accordion controlled with `openGroups` and applied `inert={!openGroups.includes(group.id)}` plus the matching `aria-hidden` directly to its Content (`configurator/index.tsx:93,382,421`); confirmed by reading the updated code. Closing content is immediately excluded while its visual exit can continue. The change is scoped to option groups; the shared brief/FAQ primitive is untouched. Trigger-initiated closes keep focus on the trigger. If closing is later made programmatic while focus is inside, move focus to the trigger before making its panel inert.

Status: resolved in code by root; rapid close → Tab still belongs in the coordinated browser pass.

## Code checks that are already sound

- The desktop card remains sticky with an available-height cap. Its content has `min-height:0`, `overflow-y:auto`, and a real keyboard entry point: `tabIndex={0}`, `role="region"` and a clear accessible name (`SelectedPlanCard.tsx:40`; `project.css:152`). Arrow/Page/Home/End scrolling can use the native scroll region. Tab can proceed from that region through Changer and then onward; there is no custom key interception or focus trap.
- The inner content's focus outline is inset within the card's surrounding padding; outer clipping does not inherently remove it. Changer retains the requested visible underline at keyboard focus.
- At desktop widths, `top:112px` plus `max-height:calc(100dvh - 180px)` leaves 68 px below the card while stuck. At a 600 px viewport height, the compact 26 px padding leaves a 368 px inner scroll box; at 360 px, it leaves 128 px. Twelve selections increase scrollable content rather than the sticky box. No ordinary short-screen dead end is evident from these constraints.
- At widths at or below 760 px, sticky positioning and the inner overflow cap no longer apply; the card stays in document flow.
- Options include explicit labels, descriptions, selected checks and prices. The summary exposes selected labels with one-time/monthly amounts. The total is a polite atomic live region and announces both amount and option count (`configurator/index.tsx:329`). Avoid making the whole scrolling card live, which would reread its heading/features on each choice.
- `Accordion type="multiple"` at `configurator/index.tsx:382` permits simultaneous open groups. Radix supplies trigger keyboard handling and expanded/content relationships.
- Options → brief → options/success shifts focus to the corresponding `tabIndex=-1` heading (`configurator/index.tsx:71,195`). The brief remains mounted under `hidden` while options are shown, preserving answers without leaving hidden controls in normal tab order (`configurator/index.tsx:470`).
- The brief disables its fieldset during sending, exposes `aria-busy`, rejects repeat in-flight submits, and retains the existing router navigation guard. Any new plan-navigation helper must continue to use the router so that `BriefNavigationGuard` can block navigation from an unfinished brief.

## Parent verification still required

**Visual contrast is unverified.** The upper texture has a very light 4% dark scrim, ordinary card copy uses translucent white plus text shadow, and the H1 explicitly has no text shadow (`project.css:22,9,42`). Code cannot establish readable contrast over the actual bright pixels. Inspect H1, Changer, feature text, 12–13 px selected option labels/prices and muted totals on the brightest textured area of all six variants. Scroll a twelve-selection summary through that area. Preserve the user's bright original texture; make any readability adjustment only where the rendered result demonstrates the need.

In the coordinated browser pass, tab into the inner card and scroll to its last selected row/total, then tab out to options at both standard desktop height and a short landscape height. Recheck rapid close → Tab after the immediate closed-panel guard is integrated. Check the reduced-motion preference both before navigating and while a transition is active.

Extremely short desktop viewports below 232 px make the current inner `max-height` calculation nonpositive (180 px reserved space + 52 px compact padding). This is a mathematical edge, not a reproduced defect. If testing includes that size, provide a positive available-height strategy before claiming every possible short-screen configuration is covered; it does not invalidate the ordinary short-height sizing above.

## Decision

No permanent keyboard trap or ordinary-height sticky blocker was established by this code review. Both concrete integration suggestions were implemented by root and verified in the updated source. Contrast, keyboard behavior in the browser and final motion quality remain for the parent's coordinated pass. No visual sign-off is claimed here.
