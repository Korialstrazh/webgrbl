# 3D burn preview and cut check

The 3D view shows how a job will turn out before material is spent: the engraved depth, the cuts, and which parts come free. It is an estimate scaled from a test burn on a real sheet, not a guarantee. Without a test it is a guess, and says so.

## Open it

1. Switch the bed to **3D** (third entry of the Design / Toolpath switch). It needs a material and a ready toolpath; the toolpath is requested for you.
2. Pick a material in the 3D toolbar, or choose **Add material...** and enter a name and a thickness (0.1 to 100 mm). The material belongs to the project; the project file carries a copy, so it opens elsewhere.
3. Orbit, zoom and pan the sheet. The camera is orthographic only.

In 3D the left panel shows the **Cut check** above Layers; Objects is hidden. STOP stays visible. Dropping an SVG onto the bed does nothing in 3D.

## Test sample

A depth estimate needs one real test per material and machine profile (lasers differ).

1. In the 3D toolbar choose **Burn test sample...** (needs a material).
2. Step 1: enter power, speed and passes (default: the project's first Line layer). The sample is a 5 x 5 cm square cut line with a black-to-white gradient inside. Press **Export sample G-code**; it uses the normal G-code download and does not touch the project's toolpath. Export is off, with a reason, without a machine profile or when the sample does not fit the work area.
3. After Export the settings are locked, so the saved ones are the ones burnt.
4. Burn it on the real laser (outside the app).
5. Step 2: choose **Cut through**, or **Not through** with an optional depth in mm (above 0, at most the thickness). The depth always describes the square's cut line. **Save for this material** stores it for the active profile. Saving without exporting is allowed (you may have burnt the same settings earlier). Cancel stores nothing.

The gradient only helps you judge shading by eye. To change shading, change the gradient in the design; the app has no shading control.

## How depth is estimated, and limits

- Dose of a move = power x runs / speed. Depth is proportional to dose, scaled from the test result. A different thickness scales the through dose by thickness / test thickness.
- "Cut through" is a lower bound: doses at or above the test dose count as through, below it the estimate is less sure. "Not through" without a depth is an upper bound.
- A closed cut is through at depth >= thickness + 10 %, borderline within 10 % of the thickness, not through below. Ends within 0.1 mm count as closed; open paths enclose nothing. No kerf, char, focus or air assist is modelled.
- No test: a default depth per dose is used, the view says it is a guess, and every part is borderline.
- The sheet is the job bounds plus 10 mm, sampled on a grid of at least 0.1 mm and at most 1,000,000 cells. Above 2,000,000 triangles the surface gets coarser; cuts stay open but may look wider. The model builds in a worker and a change to the design or toolpath makes it stale.

## Parts and lifting

- A part is a region enclosed by through cuts. Status: **Free**, **May stay attached** (borderline) or **Attached** (not through).
- Click a part, or its row in the Cut check, to select it. Free and borderline parts show an orange arrow: drag it up or down. With the part's status card focused, the arrow keys lift too (0.1 mm a step).
- No upper limit. 0.0 is absolute: the part's place in the sheet, also for a part nested in a lifted parent. Nested parts rise with their parent.
- Attached parts cannot lift; their row gives the reason and is the only way to select them.
- Pieces are cel-shaded with an ink outline. Lifts are preview only, change nothing in the project and reset when the toolpath changes.

## Warnings

Warnings name the layer and part, give predicted against needed depth, and suggest a direction in words. They never block export.

1. A part stays attached (not enough power or runs).
2. A part may stay attached (borderline).
3. A fill cuts through the sheet (a fill where none was intended).

The part count is always shown, which exposes too many separate parts. If WebGL is missing, a fixed message shows and the Cut check still works.

## Extending it

- Constants (margins, grid, caps, lift step, sample size) live in `src/utils/burn.model/burn.model.constants.ts`, `src/utils/materials/*.constants.ts`.
- Add a warning kind in `CUT_CHECK_WARNING_KIND` and its text in `getCutCheckWarningText`, with localization keys in `tools/localization/default.csv`.
- Domain code goes through `MATERIAL_REPOSITORY` and the `material` and `burnModel` slices; see [[burn-preview]] in the wiki.
