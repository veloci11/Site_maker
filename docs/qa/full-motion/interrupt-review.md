# Header and interruption review — provisional

Read-only source review on 2026-11-04. No browser, builds, tests, application edits, commits, pushes or deployment performed. Only this report was written.

**Verdict:** no confirmed blocker in the inspected link, header or public-configuration guard contracts. The replacement choreography had not landed when this review ended: `plan-motion.css` was absent and `motion.tsx` / `plan-transition.tsx` still contained the previous implementation. This is not approval of the pending adapter or final native snapshot behavior.

## Supported behavior in the inspected source

- Modified clicks, non-primary clicks, downloads, non-self targets, document reloads and external string destinations escape the custom handler before `preventDefault()` (`src/components/layout/plan-transition.tsx`, `useMotionLinkClick`, lines 17–41). The React Router `Link` / `NavLink` remains the underlying element (lines 45–52).
- The custom handler calls the router directly; it has no animation-completion callback that navigates later (`useMotionLinkClick`, lines 28–41). The outgoing animation does not own a delayed application navigation.
- Public offer changes navigate before changing configuration (`src/pages/configurator/index.tsx`, `changeOffer`, lines 182–193). `BriefNavigationGuard` delegates cancellation/confirmation to `useBlocker`, `reset()` and `proceed()` (`src/components/inquiries/BriefNavigationGuard.tsx`, lines 7–8 and 16–30). Rejecting a public offer switch therefore does not execute the private-project configuration mutation at line 190.
- Header active service entries are selected by the `besoin` query value, both desktop and mobile (`src/components/layout/PublicLayout.tsx`, `PublicHeader`, lines 45–49, 98–102 and 156–165). Desktop offers are nonmodal (line 66); navigation closes both header menus on a committed location key change (lines 51–54).
- `plan-return.ts` distinguishes `evolution` and `refonte` in `route()` (lines 22–31); `preparePlanNavigation()` is the only precommit origin preparation entry point (lines 72–88). `restorePlanScroll()` updates committed navigation geometry after route acceptance (lines 110–146).

## Required final integration checks

These are acceptance requirements for the pending implementation, not observed defects in code that had not yet landed.

1. **Prepare origin only after router acceptance.** The adapter must call `preparePlanNavigation()` from the accepted outgoing transition phase, never merely from a click/intent. A rejected brief must retain configuration and return origin. Owning entry points: `plan-transition.tsx` adapter / `usePlanNavigate`; `plan-return.ts:73`.
2. **Match the service query exactly.** Do not use only `useViewTransitionState('/contact?...')` to select participating service surfaces: the installed hook compares pathnames only (`node_modules/react-router/dist/development/chunk-6KYCQHYJ.mjs`, `useViewTransitionState`, lines 11294–11311). The new adapter must distinguish the accepted source and next `besoin` values before assigning unique surface/copy/body names. Owning function: `plan-transition.tsx`, `usePlanTransition`.
3. **Keep live menus visibly above the native layer.** Both menu implementations portal their content outside the header (`src/components/ui/dropdown-menu.tsx:11`; `src/components/ui/sheet.tsx:16`). Overlay suppression must follow actual header menu state, including the mobile sheet; a header-descendant selector cannot detect the portal content. Confirm the proposed 96px / 88px viewport clip and `pointer-events: none` in final `plan-motion.css`; header dimensions are `src/styles.css:221` and `501`.
4. **Verify immediate replacement on rapid navigation.** The installed RouterProvider skips an existing native transition (`chunk-6KYCQHYJ.mjs:6859–6862`) and its previous `finished.finally` clears transition context without an identity check (lines 6873–6879). This is a dependency-level review risk, not a reproduced defect. Final source/browser review must establish that opening FAQ/Home/another offer during motion keeps the newest destination, does not replay stale navigation, and does not leave duplicate snapshot names or an overlay over the live menus. Owning application entry points: `useMotionLinkClick`, `usePlanNavigate` and the pending accepted-context adapter.

The implementation owner received these integration requirements. The parent/final-diff reviewer owns verification of the landed adapter and runtime interruptions.
