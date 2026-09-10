# TypeScript review — September 10, 2026

Reviewed [anti-slop](https://github.com/dmmulroy/anti-slop) as guidance. Its rules reflect the author's preferences, not a universal TypeScript standard. No skill installation, plugin vendoring, or dependency changes were needed.

## Adopted

- Preserve known types through the application. SDK admission receipts, judge response metadata, and synthetic tool traces now retain concrete types instead of becoming `unknown`.
- Prefer compiler-checked construction to assertions. The provider wrapper uses `satisfies`; fixture names have a Valibot schema with an exhaustive fixture map. Non-null assertions were replaced with control flow or explicit construction.
- Keep existing rules against explicit `any` and unsafe inferred flows. Enable native Oxlint rules `oxc/no-accumulating-spread`, `typescript/no-non-null-assertion`, and `typescript/no-unnecessary-type-assertion`.
- Enable `typescript/no-floating-promises` and `typescript/no-misused-promises` to catch asynchronous work that escapes its caller's error handling.
- Test through explicit boundaries. The CLI regression tests run a real subprocess and local HTTP endpoint with a small stand-in test executable; no module mocks or model calls.

## Kept deliberately

`unknown` is appropriate for unvalidated JSON and caught errors. Valibot validates external data before field access. Replacing these boundary types with assertions or invented interfaces would weaken checking.

Readable `filter().map()` expressions and `typeof` narrowing stay. These tiny teaching fixtures do not justify iterator rewrites, and narrowing a legitimate union is useful TypeScript. Comments explaining evidence, intentional exercise defects, and completion criteria are part of the course.

The unused Effect rules and blanket naming restrictions do not fit this repository. The remaining plugin-specific policies are review guidance, not claims of automated enforcement.

## Findings and verification

- Fixed a successful eval child exit hiding a failure to archive its report. Child completion is awaited, signal listeners are removed, and archival failure yields a nonzero exit without replacing an existing failure code. Four regression cases cover success/failure with and without a report.
- Independent static review found that comment targets were validated after trimming but persisted from the original input. Routing and persistence now use the validated value.
- The reviewer also found collisions when seeded comment IDs contained gaps. Comment allocation now finds an unused ID; regression tests check both uniqueness and visibility to the state-delta grader.
- The reviewer inspected the fixes and surrounding code again and reported no actionable issues remaining before commit.
- Full verification passed on Node 22.20.0 and 26.4.0: Oxfmt, type-aware Oxlint, TypeScript, 33 deterministic tests across ten files, and the Flue build. A temporary violating file outside the repo confirmed that the lint rules fail as expected.

The four intentionally broken lesson starters are unchanged. No live-model results were collected or reclassified during this review.
