---
title: Generators and Material Database (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Generators and Material Database

LaserGRBL ships built-in job generators under the **Generate** menu: a Power vs Speed test grid, a Cutting test, a Shake (mechanical reliability) test and an embedded accuracy-test SVG. It also ships a Power/Speed helper backed by a community material database (laser model × material × action × thickness → power, speed, passes). Generator labels are drawn with a built-in single-stroke Hershey-style vector font.

## Key Takeaways

- Every generator replaces the currently loaded program (same path as opening a file) and is disabled while a new file cannot be loaded (`Core.CanLoadNewFile`, i.e. while a job runs). Output is plain G-code built in absolute mm coordinates, origin offset 3 mm, then analysed like any loaded file (preview and time estimate). Header, footer and passes custom G-code are added at send time, not by the generator. See [[lg-gcode-files]] and [[lg-streaming]].
- Input limits come from the connected machine's GRBL config: max S = `$30` (MaxPWM), max F = `$110` (MaxRateX), table size from `$130`/`$131`. If the config can't be read, the fallbacks are 1000 / 20000 / 400 mm. See [[lg-grbl-configuration]].
- Power vs Speed defaults to **M4** (dynamic power) and Cutting test defaults to **M3**. Text labels are **always** burned with `M4`, whatever mode you pick.
- Labels reuse the "text speed" and "text power" fields. In Power vs Speed the grid lines also use them, so the grid burns at text power.
- Material DB: Apply copies only **speed** and **power %** into the import dialog. **Passes (Cycles) are shown but not applied.** Remarks are never shown in the helper.
- Material DB is two XML files: a shipped/auto-updated `StandardMaterials.psh` and the user's `UserMaterials.psh`. Standard rows whose GUID is missing from the user file are re-imported on every start, so **deleting a shipped row does not stick**. Hide it with `Visible=false` instead.
- The shipped DB holds 906 records for 37 laser models (520 Engrave, 386 Cut). Strings are not normalised: there are duplicates such as "Kraft paper" and "Kraft Paper", "Mirror" and "Mirrors", and a typo "ScuplFun S6".
- The Hershey font covers ASCII 32-126 only, has a fixed ~2 mm cap height with 0.3 mm letter spacing, comes in horizontal and pre-rotated vertical variants, and is used only by the generators.

## Features

### LG-GEN-01 Power vs Speed test generator

- **What it does:** builds a raster test map. Each column is a power level (S) and each row is a speed (F). Each cell is filled with serpentine raster lines at the chosen line density. A grid is drawn around the cells, the axes get labels, and a two-line caption goes below.
- **Where in the UI:** main menu **Generate > Power vs Speed test** opens the modal "Power Vs Speed test generator" (Create! / Cancel). An info button next to Laser Mode opens the LaserGRBL laser-modes help page.
- **Options & defaults:**
  - Power (S): from `100`, to `1000`, steps `10` (range 1-20). The step size is computed as `(to-from)/(steps-1)` and displayed (default 100). Range 0..`$30`.
  - Speed (F): from `1000`, to `4000`, steps `7` (range 1-20). Step size computed (default 500). Range 0..`$110`.
  - Laser Mode: `M3 - Constant Power` or `M4 - Dynamic Power` (default **M4**).
  - Quality (Lines/mm): default `8`, range 1-50, 3 decimals, increment 1.
  - Size W × H (mm): computed as `S steps × 10` by `F steps × 10` (default 100 × 100). User-editable, range 0-1000.
  - Text speed: `1000` (0..`$110`). Text power ("pow"): `500` (0..`$30`).
  - Label: free text with placeholder. It is appended to the caption title.
  - If you set steps = 1, "from" is disabled and forced to "to", and the step size becomes 0. If you then raise steps above 1, "from" resets to 0.
- **Behaviour & gotchas:**
  - Origin offset is 3 mm on both axes. The program starts `G0 X3 Y3 S0` then `G1 <M3|M4> F<fmin>`. The laser stays enabled for the whole fill, and travel inside the fill uses `S0`.
  - Fill: for y = 0..H in steps of `1/quality`, a move `Y<3+y> S0` goes first, then one `X<cell end> S<power>` per column, alternating direction each line. `F` is re-emitted only when the row changes. Power rises with X, speed rises with Y.
  - Grid: horizontal lines, then vertical lines, all serpentine, at text speed and text power.
  - Labels: `S<value>` centred under each column (horizontal font, y = 1.5) and `F<value>` beside each row (vertical font, x = 1.5).
  - Caption above the grid: `LaserGRBL power/speed test` (plus ` [label]` if set) and `S<min> - S<max>, F<min> - F<max>, <M3|M4>,  <quality> line/mm`. A single value replaces the range when min equals max.
  - Ends with `M5`. The loaded file is named "PowerSpeed Test".
  - The generated algorithm lives in `GrblFile.GenerateGreyscaleTest`.
- **Upstream source:** [`LaserGRBL/Generator/PowerVsSpeedForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/PowerVsSpeedForm.cs) (`RestoreDefault`, `AssignMinMaxLimit`, `IiS_CurrentValueChanged`, `IiF_CurrentValueChanged`). [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`GenerateGreyscaleTest`).
- **webgrbl notes:** Status: not started.
  - Implement this as a pure function from params to a G-code string array, unit-tested against a golden output, and feed it into the normal "load program" path so preview and estimate work.
  - Read `$30`/`$110` limits from the cached machine config (IndexedDB) so the form works offline.
  - Improvements:
    - Live preview of the grid while the user edits.
    - Remember the last-used parameters per machine.
    - Optional log/percentage power scale.
    - Let the text mode follow the chosen M3/M4.
    - Export the result as a downloadable `.nc` file.
    - Link each cell to a "save as material preset" action.

### LG-GEN-02 Cutting test generator

- **What it does:** burns a matrix of 10 × 10 mm squares on a 14 mm pitch. Columns vary the speed, rows vary the pass count, and power stays fixed. Speed and pass labels and a caption are added.
- **Where in the UI:** **Generate > Cutting Test** opens the modal "Cutting test generator" (Create! / Cancel, with an info button for laser modes).
- **Options & defaults:**
  - Speed (F): from `200`, to `1000`, steps `5` (range 1-20). Step size computed (default 200). Range 0..`$110`.
  - Passes: from `1`, to `4` (each 1-20). Editing one end pushes the other so that from ≤ to.
  - Power (S): fixed `1000`, range 1-1000. The `$30` limit is **not** applied to this field.
  - Laser Mode: M3 / M4 (default **M3**).
  - Text speed `1000` (0..`$110`), text power `500` (0..`$30`), and an optional label.
  - Size W × H (display only): `F steps × 14 - 4 + 3` by `(Pmax - Pmin + 1) × 14 - 4 + 9`.
  - The steps = 1 behaviour is the same as in [[lg-generators#LG-GEN-01 Power vs Speed test generator|LG-GEN-01]].
- **Behaviour & gotchas:**
  - Starts `G0 X3 Y3 S<fixed>` then `G1 <ton> F<fmin>`.
  - Row `p` gets `pmin + p` passes. Each pass goes to the square corner with `G0`, burns `G1 X+10 F<speed> <ton>`, then `Y+10`, `X-10`, `Y-10`, then `M5`. So every pass turns the laser on and off again.
  - Labels: `F<speed>` under each column and `<n>pass` beside each row. Caption: `LaserGRBL cutting test [label]` and `S<s>, F<min> - F<max>, <pmin> - F<pmax> pass, <ton>`. Upstream has a typo here: the stray `F` in the pass range.
  - Ends with `M5`. The loaded file is named "Cutting Test".
- **Upstream source:** [`LaserGRBL/Generator/CuttingTest.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/CuttingTest.cs) (`RestoreDefault`, `ComputeSize`, `Ii_PCurrentValueChanged`). [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`GenerateCuttingTest`).
- **webgrbl notes:** Status: not started.
  - Clamp fixed power to `$30` (the upstream bug lets it exceed `$30`).
  - Fix the caption typo.
  - Improvements:
    - Let the user also vary power (third dimension) and square size.
    - Order the cells so the fastest or lowest-pass squares burn first.
    - Add an air-assist M8/M9 toggle.
    - Show the time estimate before Create.

### LG-GEN-03 Shake test generator

- **What it does:** a mechanical reliability test. It burns a small reference cross, shakes the head along one axis with many fast oscillations, returns and burns the cross again. If the two crosses overlap, the machine kept position (no missed steps).
- **Where in the UI:** **Generate > Shake Test** opens the modal "Shake Test" with explanatory text (Create! / Cancel).
- **Options & defaults:**
  - Axis: `X` or `Y` (default X).
  - Limit speed: a dropdown. The first entry is the axis max rate (`$110`/`$111`, fallback 20000), followed by every multiple of 1000 below it. Default is the first entry (the max rate).
  - Length: defaults to the axis table size `$130`/`$131` (fallback 400). Range min 50, max = table size.
  - Cross engraving Speed: `1000`, range 10..min(`$110`,`$111`).
  - Cross Power: `100`, range 1..`$30`.
- **Behaviour & gotchas:**
  - Sequence: `M5`, then `G1 F1000 X0 Y0 S0`.
  - Cross at (10,10) with 3 mm arms, burned with `M4` and the cross speed and power.
  - Four oscillation series with trip/step of 50/0.5, 100/2, 200/4 and 400/8 mm. For each centre `c` from `trip/2` to `len-trip/2` (step `trip`), and each amplitude `i` from 0 to `trip/3` (step `step`), it sends `G1 F<limit> <axis><10+c+i>` then `<axis><10+c-i>`.
  - Then it returns to (10,10), re-burns the cross and returns to the origin.
  - Uses `G1` at the limit feed rather than `G0`, so the user-chosen rate is honoured.
  - Assumes absolute mode (the standard header is `G90`). The loaded file is named `Shake Test <axis>`.
- **Upstream source:** [`LaserGRBL/Generator/ShakeTest.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/ShakeTest.cs) (`CbAxis_SelectedIndexChanged`, `AssignMinMaxLimit`). [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`GenerateShakeTest`, `GenerateShakeTest2`).
- **webgrbl notes:** Status: not started.
  - Long programs stream fine over Web Serial, but warn if `$130` is unknown.
  - Improvements:
    - Option to shake both axes and diagonals.
    - Read back the machine position (`?`) after the test to auto-detect drift when homing is available.
    - Show the expected duration.

### LG-GEN-04 Accuracy test file

- **What it does:** loads an embedded Inkscape SVG test pattern (22.54 × 24.07 mm, 140 paths and 14 circles) to check dimensional accuracy and backlash.
- **Where in the UI:** **Generate > Accuracy Test**.
- **Options & defaults:** none of its own. The file goes through the normal SVG import dialog (size, speed, power, laser mode), see [[lg-svg-import]].
- **Behaviour & gotchas:** the SVG is an embedded resource, opened with `Core.OpenFile("LaserGRBL.Generator.SVG.LaserGRBL-accuracy-test-file.svg")`.
- **Upstream source:** [`LaserGRBL/Generator/SVG/LaserGRBL-accuracy-test-file.svg`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/SVG/LaserGRBL-accuracy-test-file.svg). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnAccuracyTest_Click`).
- **webgrbl notes:** Status: not started.
  - Ship the SVG as a static asset in the PWA precache so it works offline, and feed it into the SVG import pipeline.
  - Improvement: add a printable measuring guide (expected dimensions) next to the preview.

### LG-GEN-05 Hershey vector font for generator labels

- **What it does:** turns ASCII text into G-code strokes for the generator labels and captions.
- **Where in the UI:** not directly exposed. Used by LG-GEN-01 and LG-GEN-02 only.
- **Options & defaults:**
  - `CreateString(text, centreX, centreY, F, S, horizontal, laserOnCmd)`.
  - The text is centred on (cX, cY). The cross-axis size is forced to 2 mm, and letter spacing is 0.3 mm.
  - Two glyph tables: `hor` (normal) and `ver` (rotated 90° for vertical labels). Each holds 95 glyphs for ASCII 32-126. Other characters are silently skipped.
- **Behaviour & gotchas:**
  - Each glyph is a pre-baked G-code fragment (`G0`, `M3`, `G1 ...`), offset by regex string replacement. `M3` is replaced by the caller's laser-on command, and the generators always pass `M4`.
  - The string starts with `M5 S<pow> F<speed>`, and `M5` is added after every glyph.
  - The `!` glyph embeds `F1000`, which overrides the label speed for the rest of the string.
  - The regex `Replace` substitutes substrings and could mis-patch if the same coordinate text appeared twice in one fragment.
- **Upstream source:** [`LaserGRBL/Hershey/Hershey.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Hershey/Hershey.cs) (`CreateString`, `MeasureString`, `ApplyOffset`).
- **webgrbl notes:** Status: not started.
  - Store glyphs as polyline coordinate arrays rather than G-code strings, then transform them (offset, rotate, scale) numerically. This removes the regex bug and the stray `F1000`, and allows any angle or size.
  - Consider a full Hershey or single-line font set with Unicode coverage, so localized labels (i18next) can be engraved.
  - Make the same text tool available as a general "engrave text" feature.

### LG-GEN-06 Material database (data model, storage, updates)

- **What it does:** keeps power, speed and passes presets per laser model, material, action and thickness. A standard community set is shipped and kept up to date, and user edits are merged on top.
- **Where in the UI:** edited in **Grbl > Material DB** ([[lg-generators#LG-GEN-07 Material DB editor|LG-GEN-07]]). Consumed by the PS helper ([[lg-generators#LG-GEN-08 Power/Speed helper (apply preset to import)|LG-GEN-08]]).
- **Options & defaults:** the table `Materials` (typed DataSet, XSD `MaterialDB.xsd`) has these columns:
  - `id` (GUID, primary key).
  - `Visible` (bool, default true).
  - `Model` (string, default "Generic Laser").
  - `Material` (default "Generic Material").
  - `Thickness` (string, default "", free text such as "-" or "3mm").
  - `Action` (string, default "", typically "Engrave" or "Cut").
  - `Power` (int %, default 100, valid 1-100).
  - `Speed` (int mm/min, default 1000, valid 1-100000).
  - `Cycles` (int passes, default 1, valid 1-99).
  - `Remarks` (string, optional).
  - Unique constraint `RecordUnique` on (Model, Material, Thickness, Action).
- **Behaviour & gotchas:**
  - Files live in `%AppData%\LaserGRBL\`. `StandardMaterials.psh` is installed by the setup and replaced by auto-update. `UserMaterials.psh` holds the user's full working copy. Both are DataSet XML in namespace `http://tempuri.org/MaterialDB.xsd`.
  - Load: if the user file is empty or missing, all standard rows are copied. Otherwise the user rows are loaded and every standard row whose `id` is not present is auto-imported and saved immediately. So updates flow in, but user-deleted standard rows come back.
  - Save happens only when the editor closes and only if there are changes.
  - Auto-update of the standard file (`GitHub.AsyncDownloadDB`) runs when the app's update check runs, at most once per 24 h (using the file mtime). It queries a GitHub commits API URL (`UrlManager.UpdateMaterialDB`), compares the latest commit date to the file mtime, downloads `UrlManager.DownloadMaterialDB` if newer, and stamps the mtime. The URLs are null in public source, so forks have no DB updates. See [[lg-app-features]].
  - Validation errors throw from `OnColumnChanging` with English messages such as "Please enter a valid power level (Min 1%)".
  - Shipped content at the pinned commit: 906 rows and 37 models. Brands: Algo, Atomstack, Comgo, LEON3D, Longer, MECOLOUR, NASUM, Ortur, SculpFun, Two Trees, YoraHome. There are 153 distinct material strings; the most common are Basswood, Acrylic, Leather, Bamboo, Hardwood, Plywood, Kraft paper, Stainless Steel and MDF.
- **Upstream source:** [`LaserGRBL/PSHelper/MaterialDB.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper/MaterialDB.cs) (`Load`, `SaveChanges`, `ImportServer`, `GetNewCount`, `OnColumnChanging`, `OnTableNewRow`). [`LaserGRBL/PSHelper/MaterialDB.xsd`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper/MaterialDB.xsd). [`LaserGRBL/StandardMaterials.psh`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StandardMaterials.psh). [`LaserGRBL/AutoUpdate/GitHub.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/AutoUpdate/GitHub.cs) (`AsyncDownloadDB`).
- **webgrbl notes:** Status: not started.
  - Convert `StandardMaterials.psh` to JSON at build time and precache it. Store user rows in IndexedDB as an overlay, using GUID-keyed edits plus tombstones, so deletions stick (this fixes the upstream re-import).
  - Periodic refresh through `fetch` with ETag when online, in the service worker or on app start. Respect offline mode.
  - Normalise material and model names on import (case and plural duplicates).
  - Use the existing shared-data-model helpers, and validate with the same ranges.
  - Improvements:
    - Store power as % and map it to S through `$30` at apply time, as upstream does.
    - Add laser optical power (W) and air-assist fields.
    - Allow per-row notes and photos.
    - Allow community submission via a PR or link.

### LG-GEN-07 Material DB editor

- **What it does:** an editable grid of every material row, for adding, editing, deleting, hiding and pasting rows, and for re-importing missing standard rows.
- **Where in the UI:** **Grbl > Material DB** opens the "Laser & Material Database" dialog. It has a DataGridView and a status strip with an `import` button. The "New elements: n" counter exists but is not wired up.
- **Options & defaults:**
  - Columns: id (hidden or read-only), Visible (checkbox), Model, Material, Action, Thickness, Power, Speed, Cycles, Remarks.
  - A new row gets a fresh GUID and copies Model and Material from the last non-deleted row.
- **Behaviour & gotchas:**
  - Power and Speed cells strip all non-digit characters before parsing, so "80 %" becomes 80.
  - Validation errors show an OK/Cancel message box. OK keeps the user editing.
  - **Ctrl+V** pastes clipboard TSV rows (for example from a spreadsheet) in the column order Model, Material, **Action, Thickness**, Power, Speed, Cycles, Remarks. Ints are parsed digits-only. Each failing line shows its own error.
  - `import` re-adds standard rows whose GUID is missing.
  - Changes save on close (`FormClosing`), with no Save/Cancel buttons and no undo.
  - There is no explicit export. The XML user file in the AppData folder is the only export path.
- **Upstream source:** [`LaserGRBL/PSHelper/PSEditorForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper/PSEditorForm.cs) (`Paste`, `DG_CellParsing`, `BtnImport_Click`, `PSEditorForm_FormClosing`).
- **webgrbl notes:** Status: not started.
  - Build an editable table with filter and search by model and material.
  - Add explicit **Import/Export** as JSON and CSV through the File System Access API, with a download fallback.
  - Support paste from clipboard (`navigator.clipboard.readText`, which needs a user gesture).
  - Add undo, "reset to shipped values" per row, and "restore deleted shipped rows".
  - Localize the column headers through the i18next CSV strings.

### LG-GEN-08 Power/Speed helper (apply preset to import)

- **What it does:** a picker that cascades Laser Model → Material → Action → Thickness and shows suggested Power (%), Speed (mm/min) and Passes. **Apply** pushes the values into the import options.
- **Where in the UI:** the material-database button in the raster import "Target image size and laser options" dialog and in the SVG import options dialog, see [[lg-raster-import]] and [[lg-svg-import]]. It opens "Select your configuration" (Apply / Cancel).
- **Options & defaults:**
  - Each combo lists distinct values from **visible** rows only, sorted alphabetically. A combo is disabled when it has a single choice.
  - The last selection is restored from settings `DB Last Used Laser Model`, `DB Last Used Material`, `DB Last Used Action` and `DB Last Used Thickness`, which are saved only on Apply.
- **Behaviour & gotchas:**
  - On Apply the caller sets:
    - `BorderSpeed = Speed` when border tracing is visible.
    - Raster `LinearFilling` speed = Speed (raster only; commented out for SVG).
    - `MaxPower = MaxPowerField.MaxValue × Power / 100`, where MaxValue is derived from `$30`.
  - Passes and Remarks are **not** applied.
  - `GetResult` uses `First()`. It cannot be ambiguous thanks to the unique constraint, but it throws if a cascade value disappears.
- **Upstream source:** [`LaserGRBL/PSHelper/PSHelperForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper/PSHelperForm.cs). [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs) (`BtnPSHelper_Click`). [`LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs) (`BtnPSHelper_Click`).
- **webgrbl notes:** Status: not started.
  - **Also apply passes**, which upstream drops, and show remarks.
  - Use a searchable combobox (type-ahead), and pre-filter by the laser module selected in laser-life tracking ([[lg-app-features]]).
  - Improvements:
    - Offer "Save current import settings as preset".
    - Offer "Generate cutting / power-speed test around this preset", which pre-fills LG-GEN-01 and LG-GEN-02 with a range centred on the values.

## Upstream Source

- [`LaserGRBL/Generator/PowerVsSpeedForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/PowerVsSpeedForm.cs) - Power vs Speed form, defaults and limits
- [`LaserGRBL/Generator/CuttingTest.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/CuttingTest.cs) - Cutting test form
- [`LaserGRBL/Generator/ShakeTest.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/ShakeTest.cs) - Shake test form
- [`LaserGRBL/Generator/SVG/LaserGRBL-accuracy-test-file.svg`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Generator/SVG/LaserGRBL-accuracy-test-file.svg) - embedded accuracy test pattern
- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) - G-code generation (`GenerateGreyscaleTest`, `GenerateCuttingTest`, `GenerateShakeTest`)
- [`LaserGRBL/Hershey/Hershey.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Hershey/Hershey.cs) - stroke font as G-code glyph tables
- [`LaserGRBL/PSHelper/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper) - MaterialDB DataSet, editor and helper forms
- [`LaserGRBL/StandardMaterials.psh`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StandardMaterials.psh) - shipped material database (XML)
- [`setup.iss`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/setup.iss) - installs `StandardMaterials.psh` to `{userappdata}\LaserGRBL`
