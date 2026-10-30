---
title: SVG Import (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# SVG Import

LaserGRBL opens `.svg` files and converts their outlines straight to G-code (vector cutting/engraving at a single speed and power). The user sees one small dialog (speed, power, laser mode, color filter), then the result loads as an ordinary G-code program into the job list and preview. The converter is a trimmed port of GRBL-Plotter's `GCodeFromSVG`; `SvgLibrary/` (the third-party `Svg` rendering library) is used only for the unused "load as image" path.

## Key Takeaways

- **Vector only in practice.** The "Load as Vector / Load as Image" chooser (`SvgModeForm`) exists but is hard-wired off: `GrblCore.OpenFile` always uses `Mode.Vector`. SVG fill or hatching is never produced; only outlines are traced.
- **No size, position, rotation or passes options** on import. The SVG lands at its physical size (from `width`/`height` + `viewBox`), in mm, with the SVG top-left at machine `(0, height)` (Y is flipped so the drawing sits in quadrant I).
- **One speed and one power for the whole file.** No per-color or per-layer settings. The color filter can only *include* one color class (All / Red / Green / Blue / Black) per import. To use different settings per color, import several times with **Append**.
- **Curves are flattened to G1 lines** (cubic/quadratic Béziers, path arcs `A`, ellipses). Only `<circle>` and the corners of rounded `<rect>` emit real `G3` arcs.
- **Laser on/off is done with S, not M3/M5,** when "Support Hardware PWM" is on (default): one `M3 S0`/`M4 S0` at the start, `S<max>` before each cut, `S0` after it, `M5 S0` at the end.
- **Element order is not document order.** In each container: basic shapes first (by type), then `<path>`s, then child `<g>`s recursively. No travel optimisation.
- **Unsupported:** `<text>`, `<image>` (a comment line is emitted instead), `<use>`/`<defs>`/`<symbol>`, CSS classes and `<style>` blocks, nested `<svg>`, `<a>`/`<switch>` containers, clip paths, masks, stroke width. Colors are not inherited from parent groups.
- Settings are **shared with raster import** (same keys for speed, S-MAX, S-MIN, laser mode), so changing them here changes the raster import defaults too.

## Features

### LG-SVG-01 Open an SVG file

- **What it does:** Loads a `.svg` file, asks for laser options, converts it to G-code and replaces the current program (or appends to it).
- **Where in the UI:** File > Open File (Ctrl+O), File > Append File, File > Reload Last File (Ctrl+R), drag-and-drop onto the main window, single command-line argument. The open dialog lists it under "Any supported file" and "Vector Image (experimental)|*.svg". See [[lg-gcode-files]] for the shared open/append plumbing.
- **Options & defaults:** extension match is case-insensitive `.svg` only (`.svgz` is not supported).
- **Behaviour & gotchas:**
  - Conversion runs on a background thread (`GrblFile.LoadImportedSVG` → `SafeLoadFile`). A second load while one is running shows "already loading".
  - After conversion every output line is trimmed, wrapped in a `GrblCommand`, and the whole program is re-analysed (bounding box, time estimate; see [[lg-gcode-files]] and [[lg-preview]]).
  - The file is read as text; invalid XML characters are stripped with a regex before `XElement.Parse`. Malformed XML or a color the parser cannot read aborts the import silently (the exception is only logged).
  - Generate > Accuracy Test opens an SVG embedded in the app through the same path (see [[lg-generators]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OpenFile`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImportedSVG`)
- **webgrbl notes:** Status: not started. Accept SVG through `<input type=file accept=".svg,image/svg+xml">`, the File System Access API (`showOpenFilePicker`), drag-and-drop, the PWA manifest `file_handlers` (`image/svg+xml`: `.svg`) and paste from the clipboard (SVG text from Inkscape/Illustrator). Parse with `DOMParser` (`image/svg+xml`) in a Web Worker so large files don't block the UI. Show parse errors to the user instead of failing silently.

### LG-SVG-02 Vector vs raster mode chooser (disabled)

- **What it does:** `SvgModeForm` shows two clickable previews: "Load as Vector" (outline render) and "Load as Image" (filled render), both drawn by SvgLibrary at 600 PPI.
- **Where in the UI:** Not reachable. `OpenFile` sets `mode = Vector` and the `SvgModeForm.CreateAndShow` call is commented out.
- **Options & defaults:** Raster branch, if enabled: render the SVG to a 600 DPI PNG at `<file>.svg.png` next to the source, open it with the raster import dialog ([[lg-raster-import]]), then delete the PNG.
- **Behaviour & gotchas:** Dead code, but it shows the intended design: filled SVG artwork engraved as a raster image.
- **Upstream source:** [`LaserGRBL/SvgConverter/SvgModeForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/SvgModeForm.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OpenFile`)
- **webgrbl notes:** Status: not started. Offer both modes for real. The browser can rasterise an SVG for free: draw it into an `OffscreenCanvas` through `createImageBitmap(blob)` or an `<img>`, at a user-chosen DPI, then hand the bitmap to the raster pipeline. Better still, offer per-element "cut outline" vs "fill/engrave" like LightBurn layers.

### LG-SVG-03 Laser options dialog ("Target image")

- **What it does:** Modal dialog (`SvgToGCodeForm`) shown before conversion. "Create!" converts; "Cancel" aborts.
- **Where in the UI:** Appears automatically after picking an SVG.
- **Options & defaults:**
  - **Border Speed** (mm/min, the G1 feed): default `1000` (setting `GrayScaleConversion.VectorizeOptions.BorderSpeed`), range `1`..`$110` (X max rate).
  - **Laser Mode**: `M3 - Constant Power` / `M4 - Dynamic Power`, default the stored `GrayScaleConversion.Gcode.LaserOptions.LaserOn` (`M3`). Shown as M3 when `$32` (laser mode) is off. Picking M4 while `$32=0` shows a "wrong laser mode" warning.
  - **S-MAX** (power while cutting): default the stored `...LaserOptions.PowerMax`, else `$30`. Range `1`..`$30`. A label shows it as a percentage of `$30`.
  - **S-MIN**: default `...LaserOptions.PowerMin` (`0`), range `0`..`999`. Saved but **not used** by the SVG converter.
  - Keeping S-MIN < S-MAX: editing one pushes the other by ±1.
  - S-MIN/S-MAX are hidden when "Support Hardware PWM" is off.
  - **Color Filter**: `All` (default, never remembered), `Red`, `Green`, `Blue`, `Black`. See LG-SVG-08.
  - Info buttons open lasergrbl.com help pages (laser modes, power modulation, color filter).
  - The material button opens the Power/Speed helper (Material DB). It sets Border Speed to the row speed and S-MAX to `$30 × row.Power / 100`.
- **Behaviour & gotchas:** On OK the speed, S-MAX, S-MIN and laser mode are saved to settings. These keys are the same ones raster import uses ([[lg-raster-import]], [[lg-vectorization]]). There is no "passes" field: repeat count comes from the job loop counter ([[lg-streaming]]) or from Save (Advanced Options) ([[lg-gcode-files]]).
- **Upstream source:** [`LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs) (class `SvgToGCodeForm`, `CreateAndShowDialog`, `ShowDialogForm`)
- **webgrbl notes:** Status: not started. Keep SVG defaults separate from raster defaults, or make the sharing explicit. Add what is missing: passes, size/scale with locked aspect ratio, position/anchor (9-point origin), rotation and mirror, and a live preview of the result before commit. Clamp ranges from the live `$110`/`$30`/`$32` values read over Web Serial ([[lg-grbl-configuration]]), with offline fallbacks.

### LG-SVG-04 Supported elements and parsing order

- **What it does:** Walks the SVG tree and turns each supported element into toolpaths.
- **Where in the UI:** Implicit in import.
- **Options & defaults:**
  - Basic shapes: `rect` (incl. `rx`/`ry`), `circle`, `ellipse`, `line`, `polyline`, `polygon`.
  - `path` with all commands `M m L l H h V v C c S s Q q T t A a Z z`, including implicit repeated coordinates.
  - `g` groups, recursive, with `transform`.
  - `text` and `image`: not converted. They emit comment lines such as `( ++++++ text is not supported ++++ )` / `( ++ Convert Object to Path first + )`.
- **Behaviour & gotchas:**
  - The root namespace is taken from the root `xmlns` attribute. Elements are matched by local name in that namespace.
  - Order in every container (`svg` root and each `g`): all `rect`s, then `circle`s, `ellipse`s, `line`s, `polyline`s, `polygon`s, `text`/`image` placeholders, then all `path`s, then child `g`s. Document order is lost, so inner/outer cut order is not guaranteed.
  - Group matrices live in a fixed array of 10 (`matrixGroup`), so nesting deeper than about 9 levels breaks.
  - Not handled: `use`, `defs`, `symbol`, `marker`, `clipPath`, `mask`, `pattern`, `style` elements, `class` attributes, nested `svg`, `a`, `switch`; elements inside them are skipped. `display:none` and `visibility` are ignored, so hidden layers are cut too.
  - Polyline/polygon `points` are split on spaces only and need `x,y` pairs with a comma. Tokens of 3 characters or fewer (e.g. `1,2`) are **skipped** (upstream bug). Point lists with no comma emit `( polygon coordinates - missing ',')`.
  - A `rect` with different `rx` and `ry` uses `min(rx, ry)` for both.
  - Path tokenisation splits before every letter except `e`. Numbers match `-?\d+(\.\d+)?([eE][-+]?\d+)?` or `-?\.\d+`. Relative `m` at the very start of a path is treated as absolute (per spec).
  - `Z` draws back to the subpath start. The "overlap past the start point" option (`svgClosePathExtend`) is effectively a no-op.
- **Upstream source:** [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`startConvert`, `parseBasicElements`, `parsePath`, `parsePathCommand`, `parseGroup`)
- **webgrbl notes:** Status: not started. In the browser, use the real SVG DOM: render the parsed document in a hidden `<svg>`, then use `SVGGeometryElement.getTotalLength()`/`getPointAtLength()` or `getCTM()` for exact transforms, `getComputedStyle` for inherited and CSS colors, and resolve `<use>`. That fixes most gaps above. Keep document order (or optimise travel on purpose), skip hidden elements, and offer text-to-path through an opentype.js font, or at least warn clearly.

### LG-SVG-05 Units, DPI, viewBox and coordinate mapping

- **What it does:** Turns SVG user units into machine millimetres and flips Y.
- **Where in the UI:** Implicit; no user control.
- **Options & defaults:**
  - Unit factors to px (96 DPI CSS): `in`=96, `mm`=96/25.4, `cm`=96/2.54, `pt`=96/72, `pc`=12·96/72, `em`=150 px (fixed), unitless/`px`=1. `%` is applied against an `ext` value (only meaningful for `rect` width/height).
  - Output is always mm (`svgConvertToMM = true`). Inch output exists in code but is never used.
  - Scale-to-max-size (`SvgScaleApply`, `SvgMaxSize` = 100) and `UserOffset` exist, but SVG file import leaves them off/zero. Only centerline vectorization uses them ([[lg-vectorization]]).
- **Behaviour & gotchas:**
  - With `width`, `height` and `viewBox`: X scale = `(1/mmPx)·width_px/vbWidth`, Y scale = negative of the same for height. The viewBox offset is honoured and Y is flipped so the top of the document maps to `Y = height_mm`.
  - Only `viewBox` (no width/height): 1 user unit = **1 mm** (no px→mm conversion), Y flipped.
  - No `viewBox`: 1 px = 1/96 in, Y flipped by height.
  - **Neither:** identity matrix, **no Y flip**, so the drawing comes out mirrored and 1 unit = 1 mm.
  - `width` with `%` gives nonsense sizes (the percentage is taken of 1).
  - `transform` lists are parsed in order: `translate`, `scale`, `rotate(a[,cx,cy])`, `matrix`. `skewX`/`skewY` are ignored. Element transforms multiply onto the enclosing group matrix.
  - The decimal separator is forced to `.` (`Replace(',', '.')`) on the final text.
- **Upstream source:** [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`parseGlobals`, `ConvertToPixel`, `parseTransform`, `ParseTransform`)
- **webgrbl notes:** Status: not started. Follow the SVG spec exactly, including `preserveAspectRatio` and 96 DPI. Let the user override the DPI for files from tools that assume 72 or 90 DPI (old Illustrator, old Inkscape), and show the detected physical size before converting. Reuse a well-tested matrix library (DOMMatrix is built in).

### LG-SVG-06 Curve flattening (smart vs legacy Bézier)

- **What it does:** Turns curves into straight G1 segments.
- **Where in the UI:** Settings > "Smart Bezier" checkbox (setting `Vector.UseSmartBezier`, default **on**; "better approximation since 4.6.1").
- **Options & defaults:**
  - Smart (default): adaptive De Casteljau subdivision (`BezierTools.FlattenTo`). A segment is split until both control triangles have `sqrt(area) < 0.2 / scaledError` (about 0.2 mm at output scale), max 20 subdivisions.
  - Legacy: fixed 12 equal-`t` segments per curve, whatever its size.
- **Behaviour & gotchas:**
  - `Q`/`T` are raised to cubics (control points at 2/3). `S`/`T` reflect the previous control point; after a non-curve command the reflection point is the current point.
  - Path arcs (`A`) and `<ellipse>` go through the SVG endpoint-to-center conversion (radii scaled up when too small), are split into ≤90° pieces, each turned into a cubic, then flattened. They never become G2/G3.
  - `scaledError` is the mm-per-user-unit X scale (1.0 when the SVG has no `width`), so the tolerance is roughly constant in mm.
- **Upstream source:** [`LaserGRBL/SvgConverter/BezierTools.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/BezierTools.cs) (`FlattenTo`, `FlattenSegmentTo`, `SplitCurveAtT`), [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`GetBezierApproximation`, `calcArc`)
- **webgrbl notes:** Status: not started. Expose the tolerance in mm (e.g. 0.01–0.5, default 0.05–0.1). Consider fitting G2/G3 arcs to flattened curves (biarc fitting): it shrinks the file and the GRBL planner load a lot, which matters for streaming over Web Serial ([[lg-streaming]]).

### LG-SVG-07 Arc output (G3 for circles and rounded corners)

- **What it does:** Writes native arcs where the shape is a true circle arc.
- **Where in the UI:** Implicit.
- **Options & defaults:** `<circle>` → one full-circle `G3X..Y..I..J..` from `(cx+r, cy)` with `I=-r, J=0`. Each rounded `rect` corner → one quarter `G3`. Arc splitting into lines (`gcodeNoArcs`) exists but is off.
- **Behaviour & gotchas:**
  - Direction is hard-coded to `G3`. I/J go through the linear part of the current matrix. A transform with negative determinant (e.g. `scale(-1,1)`) would need G2, but G3 is still written, so mirrored rounded corners come out wrong. Full circles are unaffected.
  - Non-uniform scaling turns a circle into an ellipse in the SVG, but LaserGRBL still writes a circular arc (I/J transformed, radius not checked), which can trigger GRBL error 33.
  - Smoothieware: an `S` word is appended to every arc line.
- **Upstream source:** [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`gcodeArcToCCW`, `translateIJ`), [`LaserGRBL/SvgConverter/gcodeRelated.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/gcodeRelated.cs) (`Arc`, `MoveArc`, `splitArc`)
- **webgrbl notes:** Status: not started. Pick G2/G3 from the matrix determinant. Fall back to line segments under non-uniform scale or skew.

### LG-SVG-08 Color filter

- **What it does:** Imports only the elements whose color falls in the chosen class.
- **Where in the UI:** "Color / Filter" combo in the import dialog (LG-SVG-03).
- **Options & defaults:** `All` (default) | `Red` (R ≥ 127, G ≤ 20, B ≤ 20) | `Green` (G > 127, R,B ≤ 20) | `Blue` (B > 127, R,G ≤ 20) | `Black` (R,G,B ≤ 20).
- **Behaviour & gotchas:**
  - The element color is the first found of: `style` `stroke:`, `style` `fill:`, `stroke` attribute, `fill` attribute. `none` values are skipped.
  - An element with **no color**, or one whose color parses to empty, is **included** whatever the filter.
  - Colors come from .NET `ColorTranslator.FromHtml`: `#rrggbb`, `#rgb`, and named colors. `rgb()`, `url(#gradient)` and `currentColor` throw and abort the whole import.
  - Applies to basic shapes and paths only. Group (`g`) colors are not inherited, and groups themselves are always walked.
  - Duplicate keys inside one `style` attribute throw (dictionary build).
- **Upstream source:** [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`ColorFilter`, `filterByColor`, `parseStyle`, `parseColorAttributes`)
- **webgrbl notes:** Status: not started. Replace with a real layer model: group elements by their computed stroke/fill color (inheritance resolved via `getComputedStyle`). Show one row per detected color with its own enable / mode (line, fill, raster) / speed / power / passes / order, as in LightBurn. A single-color filter can then be a shortcut.

### LG-SVG-09 G-code output shape

- **What it does:** Writes the converted toolpath as a G-code program.
- **Where in the UI:** Visible in the job list after import; savable via [[lg-gcode-files]].
- **Options & defaults:**
  - Settings > "Support PWM" (`Support Hardware PWM`, default **on**). Program start `M3 S0` (or `M4 S0`); before each cut (pen down) `S<S-MAX>`; after it (pen up) `S0`; program end `M5 S0`.
  - PWM off: start `M5 S<$30>`, pen down `M3`/`M4`, pen up `M5` (the stored `...LaserOptions.LaserOff`, default `M5`), end `M5 S0`.
  - Rapids: `G0`, or `G1` when Settings > "Disable G0 fast skip" is on (default off). The travel then runs at Border Speed with S0.
  - Numbers formatted `0.###` (up to 3 decimals, trailing zeros dropped).
  - Compressed output (`gcodeCompress = true`): the G word only when the motion mode changes, X/Y only when changed, F only on the first G1 after each pen-down or after a feed change.
- **Behaviour & gotchas:**
  - Example with PWM on (comments shown as generated; LaserGRBL strips them when it parses the program):

    ```gcode
    M3 S0
    S0(1st shape)
    G0X10Y40(M)
    S1000(M)
    G1X50F1000(L)
    Y10(L)
    X10Y40(Z)
    S0(Z)
    G0X12.5Y20(M)
    ...
    M5 S0
    ```

  - Smoothieware (`Firmware Type` setting): S values divided by 255 and `S` repeated on each G1/G2/G3.
  - Pause-before-element/pen-down, point-reduction (`gcodeReduce`), drag-knife compensation and line segmentation exist in code but are all disabled.
  - Appending an SVG to an existing program adds another full `M3 S0 … M5 S0` block.
- **Upstream source:** [`LaserGRBL/SvgConverter/gcodeRelated.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/gcodeRelated.cs) (`setup`, `PutInitialCommand`, `PutFinalCommand`, `PenDown`, `PenUp`, `Move`, `MoveTo`, `MoveToRapid`), [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) (`convertSVG`, `gcodeStartPath`, `gcodeMoveTo`, `gcodePenUp`, `gcodePenDown`)
- **webgrbl notes:** Status: not started. Generate an intermediate toolpath model (polylines + arcs + per-layer params), not text, and emit G-code at the end. That lets the preview, travel optimisation, time estimation and the "S vs M3/M5" choice share one representation. With `$32=1` in M4 mode, consider staying in `G1 … S0` for short travels to avoid planner stops, and order closed inner shapes before outer ones.

### LG-SVG-10 Append SVG to the current job

- **What it does:** Adds the converted SVG after the existing program instead of replacing it.
- **Where in the UI:** File > Append File.
- **Options & defaults:** The same dialog and settings as a normal open (LG-SVG-03).
- **Behaviour & gotchas:** No offset is applied, so appended artwork overlaps at its own SVG coordinates. Ranges and time are recomputed for the whole program. This append-per-color workflow is the only way to get different power/speed per color.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImportedSVG(append)`)
- **webgrbl notes:** Status: not started. Model a job as a list of placed objects (each with source, transform and layer params) instead of concatenated G-code. Append then becomes "add object", with drag-to-position on the canvas ([[lg-preview]]).

## Upstream Source

- [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs) - SVG tree walk, units/transforms, path parser, color filter, arc/Bézier flattening (from GRBL-Plotter)
- [`LaserGRBL/SvgConverter/gcodeRelated.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/gcodeRelated.cs) - static G-code writer (pen up/down, compressed moves, arcs, Smoothie handling)
- [`LaserGRBL/SvgConverter/BezierTools.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/BezierTools.cs) - adaptive Bézier flattening ("smart Bézier")
- [`LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/ConvertSizeAndOptionForm.cs) - import dialog `SvgToGCodeForm` (speed, power, laser mode, color filter)
- [`LaserGRBL/SvgConverter/SvgModeForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/SvgModeForm.cs) - vector/raster chooser (unused)
- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) - `LoadImportedSVG`
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - `OpenFile` dispatch by extension
- `LaserGRBL/SvgLibrary/` - third-party SVG rendering library (svg-net), used only by the disabled raster path
