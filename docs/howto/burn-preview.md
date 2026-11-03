# 3D burn preview and cut check

The 3D view shows how a job will turn out before material is spent: the engraved depth, the cuts, and which parts come free. It is an estimate scaled from a test burn on a real sheet, not a guarantee. Without a test it is a guess, and says so.

## Open it

1. In **Design**, pick a material in the toolbar (the user moved it there from 3D; 3D shows it as read-only text and, with none chosen, tells you to pick one in Design), or choose **Add material...** and enter a name and a thickness (0.1 to 100 mm). Save waits for both to be valid. A name and thickness you already have bring a note and **Use that one**; saving a copy stays allowed. The list marks materials tested on the active machine as **Tested**. The material belongs to the project; the project file carries a copy, so it opens elsewhere.
2. Switch the bed to **3D** (the cube icon of the view switch). It needs a material and a ready toolpath; the toolpath is requested for you.
3. Orbit, zoom and pan the sheet. The camera is orthographic only.

In 3D the left panel shows the **Cut check** above Layers; Objects is hidden. STOP stays visible. Dropping an SVG onto the bed does nothing in 3D.

## Test sample

A depth estimate needs one real test per material and machine profile (lasers differ).

1. In the 3D toolbar choose **Burn test sample...** (needs a material).
2. Step 1: enter power, speed and passes (default: the project's first Line layer). The sample is a 5 x 5 cm square cut line with a black-to-white gradient inside. Press **Export sample G-code**, the main button until the export; it uses the normal G-code download and does not touch the project's toolpath. Export is off, with a reason, without a machine profile, when the sample does not fit the work area, or when a setting is out of range (power 1 to 100 %, speed 1 to 20000 mm/min, passes 1 to 50). If the export fails, a message says so.
3. After Export the settings are locked, so the saved ones are the ones burnt.
4. Burn it on the real laser (outside the app).
5. Step 2: choose **Cut through**, or **Not through** with an optional depth in mm (above 0, at most the thickness). The depth always describes the square's cut line. **Save for this material** stores it for the active profile. Saving without exporting is allowed (you may have burnt the same settings earlier). Cancel stores nothing.

The gradient only helps you judge shading by eye. To change shading, change the gradient in the design; the app has no shading control.

## How depth is estimated, and limits

- Dose of a move = power x runs / speed. Depth is proportional to dose, scaled from the test result. A different thickness scales the through dose by thickness / test thickness.
- "Cut through" is a lower bound: doses at or above the test dose count as through, below it the estimate is less sure. "Not through" without a depth is an upper bound.
- A closed cut is through at depth >= thickness + 10 %, borderline within 10 % of the thickness, not through below. Ends within 0.1 mm count as closed; open paths enclose nothing. No kerf, char, focus or air assist is modelled.
- Identical paths (passes, duplicate outlines, the same path on two layers) add their dose. Separate cuts that merely share a grid cell do not count as one deeper cut: if only their sum would reach through, the part shows **May stay attached** or **Attached** (not through), never **Free**.
- Known limit: the grid cell grows with the sheet, about 0.4 mm on a 400 mm sheet and about 1 mm on a 1000 mm sheet (sheet size divided by the square root of 1,000,000 cells). Uncut tabs or bridges smaller than about a cell or two can be missed, so a part held by small tabs may show as "comes free". Measured: tabs up to 0.6 mm on a 400 mm sheet and up to 1.5 mm on a 1000 mm sheet.
- No test: a default depth per dose is used, the view says it is a guess, and every part is borderline.
- The sheet is the job bounds plus 10 mm, sampled on a grid of at least 0.1 mm and at most 1,000,000 cells. Above 2,000,000 triangles the surface gets coarser; cuts stay open but may look wider. The model builds in a worker and a change to the design or toolpath makes it stale.

## Parts and lifting

- A part is a region enclosed by through cuts. Status: **Free**, **May stay attached** (borderline) or **Attached** (not through).
- Hover a part or its row to highlight it; click either to select it, which also scrolls its row into view in the list. Free and borderline parts show an orange arrow: drag it up or down. The bar below the scene shows the height ("Lifted 40.0 mm"); with it focused, the arrow keys lift too (1 mm a step). Lifted parts show their height in their row, and **Put all back** resets every lift.
- Orbit stops about 80 degrees from vertical. **Fit** brings back the first view and **Top** looks straight down.
- No upper limit. 0.0 is absolute: the part's place in the sheet, also for a part nested in a lifted parent. Nested parts rise with their parent.
- Attached parts cannot lift; their row gives the reason and is the only way to select them.
- Pieces are cel-shaded with an ink outline. Lifts are preview only, change nothing in the project and reset when the toolpath changes.

## Warnings

Warnings of the same kind, layer and shown depths form one alert with the part count, the depths and a suggestion. The selected row shows its own part's warning. They never block export.

1. A part stays attached (not enough power or runs).
2. A part may stay attached (borderline).
3. A fill cuts through the sheet (a fill where none was intended).

The part count is always shown, which exposes too many separate parts. If WebGL is missing, a fixed message shows and the Cut check still works.

## Extending it

- Constants (margins, grid, caps, lift step) live in `src/utils/burn.model/burn.model.constants.ts`; the sample size lives in `src/utils/materials/sample.job.constants.ts`.
- Add a warning kind in `CUT_CHECK_WARNING_KIND` and its text in `getCutCheckWarningText`, with localization keys in `tools/localization/default.csv`.
- Domain code goes through `MATERIAL_REPOSITORY` and the `material` and `burnModel` slices; see [[burn-preview]] in the wiki.
