# Task 5 report: cut check

Red run: `vitest run src/utils/burn.model/get.cut.check` -> FAIL, "Failed to resolve import ./get.cut.check" (Test Files 1 failed, no tests).
Green run: `vitest run src/utils/burn.model` -> Tests 73 passed (73), 7 files. tsc and eslint on burn.model clean.

Files: get.cut.check.ts, get.cut.check.test.ts, interfaces CutCheck/CutCheckWarning/CutCheckInput, CUT_CHECK_WARNING_KIND in burn.model.constants.ts.

Concerns:
- The grid stores only total fillDose, so FILL_CUTS_THROUGH names every enabled Fill layer with a non-zero own dose when the peak fill cell reaches the thickness, not only those overlapping at that cell.
- The toolpath paints later fills over earlier ones, so two fill layers cannot overlap via getToolpath on one job. The overlap test builds one toolpath per layer and concatenates their moves.
- Part warnings use the part's weakest wall; a part with no weakest layer gets layerKey ''.
