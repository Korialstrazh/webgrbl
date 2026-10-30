---
title: Image Vectorization (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Image Vectorization

Two raster-wizard tools turn a bitmap into vector toolpaths instead of scan lines:

- **Vectorize!** traces the outlines of black regions with an embedded C# port of Potrace. It can fill them with hatch patterns (Clipper), inset contours or raster lines, and emits Bézier curves as G2/G3 arcs.
- **Centerline** runs the bundled `autotrace.exe -centerline` to get single-stroke paths and feeds the resulting SVG through the SVG-to-G-code converter.

Both share the wizard, the image adjustments and step 2 (size, offset, speed, power) described in [[lg-raster-import]].

## Key Takeaways

- Vectorize binarises the adjusted image itself. Potrace treats a pixel as black when `R+G+B < 0.5·255·3`; the optional B&W threshold is applied before that.
- The tracing resolution is not the Quality field. It is fixed at 10 px/mm, or "adaptive" `255·sqrt(sqrt(W·H))⁻¹` clamped to 4–255 px/mm. Centerline always uses 10 px/mm.
- Potrace parameters map directly to UI fields:
  - Spot Removal → `turdsize` (default 2)
  - Smoothing → `alphamax` (0 when disabled, meaning all corners)
  - Optimize → `opttolerance` + `curveoptimizing`
  - `turnpolicy` is fixed at `minority`
- Border G-code per path is `G0` to start, laser on (`S{S-MAX}` with PWM or `M3/M4` without), then `G1`/`G2`/`G3` moves, then laser off (`S0` or `M5`). Power is constant S-MAX and S-MIN is unused.
- Béziers are converted to biarcs (inflection split, incenter join point, 2 px tolerance at 5 px sampling). Arcs with a chord ≤ 0.5 mm, or that are nearly flat, become `G1`.
- Path order: inner contours first by default (the Potrace list reversed). With **Optimize Travel**, greedy nearest-neighbour ordering starts from the path nearest to the origin.
- There are 12 vector fill patterns (Clipper intersection or offset) and 3 raster fills. Cross, Diagonal Cross and Squares ask for confirmation when quality is above 2 lines/mm because they are slow.
- Centerline depends on a native Windows executable and temporary files. webgrbl needs a WASM build or a JS skeletonisation alternative.
- Upstream Potrace uses **static mutable state** (`Potrace.turdsize`, the path list), shared between preview and generation threads. Isolate it per worker in webgrbl.

## Features

### LG-VECT-01 Vectorize! tool and image preparation

- **What it does:** traces filled black regions of the adjusted image into closed vector contours and engraves or cuts their outlines, optionally with a filling.
- **Where in the UI:** Import Raster Image > Conversion Tool > **Vectorize!** (tooltip "Produce vector path"). This shows the **Vectorize! Options** group.
- **Options & defaults:**
  - Shared Parameters: Resize, Grayscale, Brightness, Contrast, B&W threshold, White Clip ([[lg-raster-import]] LG-RAST-04…08).
  - Vectorize options: LG-VECT-02…05 and LG-VECT-08…11.
  - Step 2: Border Speed, Filling Speed (only if a filling is selected), Laser Mode, S-MIN, S-MAX.
- **Behaviour & gotchas:**
  - Pipeline:
    1. Optional downsample (LG-VECT-04).
    2. Resize to `W_mm·res × H_mm·res`.
    3. Grayscale.
    4. White clip.
    5. Threshold: composite onto white, plus the optional B&W threshold.
    6. Flip vertically (Y up).
    7. Potrace binarisation at 50 % of the RGB sum.
    8. Trace.
  - `res` comes from LG-VECT-03, not from the Line To Line Quality. The memory cap from LG-RAST-12 still applies.
  - Usage counter: `Vectorization`.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`DoTrueWork`, `ProduceBitmap`, `ProduceBitmap2`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImagePotrace`), [`LaserGRBL/CsPotrace/CsPotrace.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotrace.cs) (`ConvertBitmap`, `PotraceTrace`)
- **webgrbl notes:** Status: not started.
  - Run the whole pipeline in a Web Worker: `OffscreenCanvas` for resize and colour, then a binary `Uint8Array` for the tracer.
  - Expose the binarisation threshold directly instead of hiding a fixed 50 % behind brightness and contrast.
  - Offer an "invert trace" option (trace white regions) and colour-layer tracing (posterise, then trace each level as its own layer with its own speed and power).

### LG-VECT-02 Potrace tracing parameters

- **What it does:** controls noise removal, corner detection and curve simplification of the trace.
- **Where in the UI:** Vectorize! Options:
  - **Spot Removal**: checkbox + integer field, tooltip "Remove small details"
  - **Smoothing**: checkbox + decimal field, tooltip "Smooth hard edges"
  - **Optimize**: checkbox + decimal field, tooltip "Optimize path (produce less segments)"

  Each field is enabled only when its checkbox is checked.
- **Options & defaults:**

  | UI | Range / step | Default value | Default enabled | Potrace parameter (when disabled) |
  |---|---|---|---|---|
  | Spot Removal | 2–100, integer | 2 | off | `turdsize` = value (2) |
  | Smoothing | 0.0–100.0, step 0.1 | 1.0 | off | `alphamax` = value (0.0, all corners) |
  | Optimize | 0.2–50.0, step 0.1 | 0.2 | off | `opttolerance` = value (0.2) and `curveoptimizing` = true (false) |

  Settings keys: `GrayScaleConversion.VectorizeOptions.SpotRemoval.Enabled/Value`, `...Smooting.Enabled/Value` (sic), `...Optimize.Enabled/Value`.
- **Behaviour & gotchas:**
  - `turdsize`: paths enclosing an area ≤ turdsize px are discarded (despeckle).
  - `alphamax`: corner threshold. Near 0 every vertex is a corner (polygonal look); about 1.0 is the Potrace default; ≥ 1.3334 means no corners (fully smooth). With Smoothing disabled the trace is polygonal (lines only).
  - `opttolerance`: maximum error allowed when merging consecutive Bézier segments into one.
  - `turnpolicy` = minority is hard-coded. Ambiguous diagonal pixels are resolved toward the locally less frequent colour.
  - The binarisation threshold constant is `Treshold = 0.5`.
  - The trace pipeline is the standard Potrace one: `bmToPathlist` → `calcSums` → `calcLon` → `bestPolygon` → `adjustVertices` → `smooth` → `optiCurve`.
  - The output is a list of paths, each a list of `Curve` (Line or Bezier, with points A/B and control points). Outer contours come first, followed by holes.
- **Upstream source:** [`LaserGRBL/CsPotrace/CsPotrace.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotrace.cs) (`Potrace.turdsize`, `alphamax`, `opttolerance`, `curveoptimizing`, `turnpolicy`, `PotraceTrace`, `tracetoList`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`LoadSettings`). The port is CsPotrace by Wolfgang Nagl, after Peter Selinger's Potrace (GPLv2+).
- **webgrbl notes:** Status: not started.
  - Options: the JS potrace port (kilobtye `potrace.js`, the same lineage as CsPotrace and easy to port 1:1); `potrace-wasm` / `esm-potrace-wasm` (Emscripten builds of the C library, much faster); or a TS port of CsPotrace for byte-identical parity.
  - Potrace is GPL. Check compatibility with webgrbl's licence before bundling.
  - Expose `turnpolicy`, and show the corner threshold as a 0–1.34 slider instead of a 0–100 field.

### LG-VECT-03 Adaptive quality (tracing resolution)

- **What it does:** picks the bitmap resolution used for tracing.
- **Where in the UI:** Vectorize! Options > **Adaptive quality** checkbox with an info button (tooltip "Increase/decrease vectorization quality proportionally to image output size", link to the LaserGRBL docs).
- **Options & defaults:** default off (`GrayScaleConversion.VectorizeOptions.UseAdaptiveQuality.Enabled`).
- **Behaviour & gotchas:**
  - Off: `res = 10` px/mm (legacy behaviour).
  - On: `side = sqrt(W_mm·H_mm)` and `res = clamp(255·side^-0.5, 4, 255)`. Examples: 10×10 mm gives about 80.6 px/mm; 100×100 mm gives 25.5; 500×500 mm gives about 11.4.
  - The memory cap from LG-RAST-12 then applies.
  - All vector geometry is in pixel units and is divided by `res` (with offset) only when G-code is written.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`GetVectorQuality`, `DoTrueWork`)
- **webgrbl notes:** Status: not started.
  - Make the trace resolution an explicit px/mm field with an "auto" preset.
  - Cap it by worker memory budget: a 300×300 mm image at 25 px/mm is already 56 M px, about 56 MB as a binary map and 225 MB as RGBA. Prefer tracing a binary map and never materialise RGBA at full size.

### LG-VECT-04 Downsampling

- **What it does:** pre-smooths high-resolution sources before tracing.
- **Where in the UI:** Vectorize! Options > **Downsampling** checkbox + field (tooltip "Scale down original image [for HI-Res image]").
- **Options & defaults:** 1.0–10.0, step 0.1, default value 2.0, disabled by default. Keys `...DownSample.Enabled/Value`.
- **Behaviour & gotchas:**
  - Active only for Vectorize, when enabled and value > 1.
  - The source is bicubic-resized to `target/DownSampling` and then resized back up to the target size with the chosen interpolation. The net effect is a blur or low-pass that removes jaggies and noise; the traced bitmap keeps the same pixel count.
  - Also applied to the preview.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`ProduceBitmap`)
- **webgrbl notes:** Status: not started.
  - Replace it with an explicit Gaussian blur radius (in mm) plus a median/despeckle filter, which is clearer to users and cheap in a worker or WebGL.

### LG-VECT-05 Vector preview

- **What it does:** shows the trace result live.
- **Where in the UI:** the Preview tab of the Import Raster Image wizard.
- **Options & defaults:** none.
- **Behaviour & gotchas:**
  - The trace runs on the picture-box-sized bitmap, so it is coarser or finer than the final trace.
  - Rendering:
    1. Clear to white.
    2. Fill the paths black: alpha 255 if a filling is selected, otherwise alpha 30 (faint gray).
    3. Overlay the filling direction with the line-preview stripes (LG-RAST-13). These are approximate; Hilbert, Inset and ZigZag show only partial or diagonal stripes.
    4. Draw the borders in red, 1 px.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`PreviewVector`, `PreviewLineByLine`), [`LaserGRBL/CsPotrace/CsPotraceExport.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExport.cs) (`Export2GDIPlus`)
- **webgrbl notes:** Status: not started.
  - Render the real toolpath as SVG or Canvas `Path2D`: the actual fill lines at true spacing, borders, and optionally rapids, at the real trace resolution, debounced in a worker.
  - Show node and segment counts and the estimated time.

### LG-VECT-06 Border (outline) G-code and path ordering

- **What it does:** cuts or engraves every traced contour.
- **Where in the UI:** always emitted for Vectorize!. Vectorize! Options > **Optimize Travel** checkbox (`CbOptimizeFast`); step 2 > **Border Speed**.
- **Options & defaults:** Optimize Travel is off by default (`GrayScaleConversion.VectorizeOptions.OptimizeFast.Enabled`). Border Speed: 1…`$110`, default 1000.
- **Behaviour & gotchas:**
  - The output block order in `LoadImagePotrace` is:
    1. The optional raster fill block ([[lg-raster-import]] LG-RAST-21).
    2. `{M3|M4} S0` with PWM, or `M5 S{$30}` without.
    3. The optional vector fill (`F{fillSpeed}` + paths).
    4. `F{borderSpeed}` + border paths.
    5. `M5` (PWM only).
  - Each path (`Export2GCode` → `GetPathGC`):

    ```gcode
    G0 X{x0} Y{y0}          ; skip command (G1 if "Disable G0 fast skip")
    S{S-MAX}                ; with PWM; without PWM: M3 or M4
    G1 X.. Y..              ; Line curves
    G2/G3 X.. Y.. I.. J..   ; Bezier curves as biarcs (LG-VECT-07)
    S0                      ; with PWM; without PWM: M5
    ```

  - Coordinates are `(px + offset·res)/res`, formatted `0.###` invariant (NaN becomes `0`). Absolute mode depends on the header ([[lg-gcode-files]]). Curves with a NaN length are skipped.
  - Ordering:
    - Default: the Potrace list reversed, so holes and inner contours are cut before outer ones (parts do not drop early).
    - Optimize Travel: a greedy nearest-neighbour tour. It starts at the path whose first point is closest to (0,0); the cost is the squared distance from one path's end to the next path's start, with no path reversal. It uses an O(n²) cost matrix and **ignores the inner-first rule**.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImagePotrace`, `OptimizePaths`, `SquareDistance`), [`LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs) (`Export2GCode`, `GetPathGC`, `OnPathBegin`, `OnPathSegment`, `OnPathEnd`)
- **webgrbl notes:** Status: not started.
  - Better ordering: respect containment (inner before outer) and still optimise travel within each nesting level. Allow path reversal and choosing the start vertex of closed loops.
  - Use 2-opt refinement.
  - Use a spatial index (k-d tree) instead of an O(n²) matrix, which explodes in memory with thousands of paths.
  - Add kerf offset, lead-in/out and tabs for cutting.

### LG-VECT-07 Bézier to biarc conversion (G2/G3)

- **What it does:** emits Potrace cubic Béziers as circular arcs, which GRBL executes natively and smoothly.
- **Where in the UI:** automatic, no option. The global "Smart Bezier" setting applies only to the SVG converter and Centerline.
- **Options & defaults:** sampling step 5 px, tolerance 2 px (in trace pixels: at 10 px/mm that is 0.5 mm and 0.2 mm).
- **Behaviour & gotchas:**
  - Algorithm (`ApproxCubicBezier`):
    1. Split the cubic at its real inflection points (0, 1 or 2).
    2. For each piece, intersect the end tangents at V. The join point G is the incenter of triangle (P1, V, P2), and a biarc (two tangent-continuous arcs) is built through G.
    3. Sample both curves every `samplingStep` along the biarc length. If the maximum distance exceeds the tolerance, split the Bézier at the parameter of maximum error and repeat.
    4. If one piece would need more than 1000 samples, the method returns `null` and the whole curve becomes a single `G1` to its end. Any exception does the same.
  - Arc output: `G{2|3} X{end} Y{end} I{cx−startX} J{cy−startY}` (I/J relative to the arc start, in mm). `G2` is chosen when `!arc.IsClockwise`, which compensates for the Y flip.
  - Degenerate arcs become `G1 X Y`: `r == 0`, chord length 0, chord ≤ 0.5 mm, or `r/chord > 1000` (nearly straight). Arcs whose length is NaN are skipped.
- **Upstream source:** [`LaserGRBL/CsPotrace/BezierToBiarc/Algorithm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/BezierToBiarc/Algorithm.cs) (`ApproxCubicBezier`), [`LaserGRBL/CsPotrace/BezierToBiarc/BiArc.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/BezierToBiarc/BiArc.cs), [`LaserGRBL/CsPotrace/BezierToBiarc/Arc.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/BezierToBiarc/Arc.cs), [`LaserGRBL/CsPotrace/BezierToBiarc/CubicBezier.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/BezierToBiarc/CubicBezier.cs), [`LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs) (`GetArcGC`, `CasoLimite`). There is no attribution in the source; it matches the well-known open-source "bezier2biarc" approach.
- **webgrbl notes:** Status: not started.
  - Port it as a small pure TS module and share it with SVG import ([[lg-svg-import]]).
  - Express the tolerance in mm, not trace pixels, so the result does not depend on resolution.
  - Replace the hard "> 1000 samples gives a straight line" fallback with recursive subdivision, because it currently produces visible straight chords on large curves.
  - Offer a "lines only" option for firmware without arc support, and arc output in `G17` with `R` for debugging.

### LG-VECT-08 Vector fill patterns (Clipper hatch)

- **What it does:** fills traced shapes with vector line patterns, clipped exactly to the outlines.
- **Where in the UI:** Vectorize! Options > **Filling** combobox (tooltip "Enable path filling / set filling direction"). The list contains, in order: No Filling, Horizontal, Vertical, Diagonal, Diagonal Reversed, Grid, Diagonal Grid, Cross Fill, Diagonal Cross Fill, Squares, Zig Zag, Hilbert, Inset Filling, Horizontal (old), Vertical (old), Diagonal (old). Selecting anything but No Filling shows **Filling Quality** (LG-VECT-11).
- **Options & defaults:** default **No Filling** (`GrayScaleConversion.VectorizeOptions.FillingDirection`).
- **Behaviour & gotchas:**
  - Let `step = res/fres` px (line pitch), `dstep = step·√2` and `rdstep = step/√2`.
  - The subject is a set of open polylines over the bitmap rectangle W×H. The clip is all traced paths, with Béziers flattened by GDI+ and scaled ×1000 to Clipper integers.
  - The operation is `Clipper.Execute(ctIntersection, PolyTree, pftEvenOdd, pftEvenOdd)`, then `OpenPathsFromPolyTree`. Even-odd makes holes stay empty.
  - Alternate lines are reversed (serpentine), but Clipper may reorder them.

  | Pattern | Geometry generated before clipping |
  |---|---|
  | Horizontal | lines `y = k·step` (k ≥ 1), alternating direction |
  | Vertical | lines `x = k·step` (k ≥ 1), alternating direction |
  | Diagonal | lines from (0, i·dstep) to (i·dstep, 0), i from 0 to (W+H)/dstep |
  | Diagonal Reversed | lines from (0, H−i·dstep) to (i·dstep, H) |
  | Grid | Horizontal + Vertical |
  | Diagonal Grid | Diagonal + Diagonal Reversed |
  | Cross Fill | at each grid node (k·step, j·step): a "+" of arm length step/3 |
  | Diagonal Cross Fill | at each node: an "×" of half-diagonal rdstep/3 |
  | Squares | at each node: a closed diamond of radius step/3 |
  | Zig Zag | staircase polylines with steps of dstep/2 along 45° bands, alternating start corner |
  | Hilbert | Hilbert curve depth 6 (64·step tile) repeated over the area |
  | Inset Filling | concentric offsets, see LG-VECT-09 |

  - **Path ordering:** `ParallelOptimizePaths` splits the fill paths into blocks of at most 2048 and runs greedy nearest-neighbour (LG-VECT-06) on each block in parallel tasks. Blocks are concatenated, so there is no global optimisation across blocks.
  - **G-code:** `F{fillSpeed}`, then each fill path as in LG-VECT-06 (`G0` start, `S{S-MAX}`, `G1`…, `S0`). Fill paths are lines only. They are emitted **before** the borders.
  - **Confirmation:** choosing Cross Fill, Diagonal Cross Fill or Squares with Filling Quality > 2 shows "Using {pattern} with quality > 2 line/mm could be very time consuming with big image. Continue?" (default button Cancel).
- **Upstream source:** [`LaserGRBL/CsPotrace/PotraceClipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/PotraceClipper.cs) (`BuildFilling`, `BuildGridFilling`, `AddGridSubject`, `AddGridClip`, `ToPotraceList`, `Hilbert`), [`LaserGRBL/Clipper/Clipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Clipper/Clipper.cs) (Angus Johnson's Clipper 6), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`VectorFilling`, `TimeConsumingFilling`, `ParallelOptimizePaths`, `LoadImagePotrace`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`BtnCreateClick`)
- **webgrbl notes:** Status: not started.
  - Use `clipper2-js` / Clipper2 WASM (open-path intersection) or `clipper-lib` (the JS port of Clipper 6) for parity.
  - Generate fill lines analytically per scanline (polygon-scanline intersection), which is far faster than clipping huge line sets and avoids the confirmation dialog.
  - Add: arbitrary hatch angle, crosshatch at any angle, a fill-before/after-border option, a hatch offset from the border (LaserGRBL fills right up to the edge), and a per-layer power for the fill vs the border (LaserGRBL uses S-MAX for both).

### LG-VECT-09 Inset filling (Clipper offset)

- **What it does:** fills shapes with concentric contours that follow the outline inward.
- **Where in the UI:** Vectorize! Options > Filling = **Inset Filling**.
- **Options & defaults:** spacing = `res/fres` px from Filling Quality.
- **Behaviour & gotchas:**
  - All traced paths (flattened, ×1000) are added to one `ClipperOffset` with `jtRound`, `etClosedPolygon`.
  - For i = 1, 2, … it runs `Execute(−spacing·i·1000)` and adds the closed results, stopping when the result is empty.
  - Outlines are offset together (hole-aware via orientation).
  - The order is ring by ring outward-in, then greedy-optimised in blocks as in LG-VECT-08.
  - The rounded joins smooth sharp corners progressively.
- **Upstream source:** [`LaserGRBL/CsPotrace/PotraceClipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/PotraceClipper.cs) (`BuildInsetFilling`, `AddOffsetSubject`), [`LaserGRBL/Clipper/Clipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Clipper/Clipper.cs) (`ClipperOffset`)
- **webgrbl notes:** Status: not started.
  - Clipper2's `InflatePaths` covers this.
  - Order rings inside-out or outside-in per island, linking consecutive rings to cut rapids.
  - Allow a max ring count (outline-only "thick border" effect) and miter or square joins.

### LG-VECT-10 Raster filling of traced shapes

- **What it does:** fills traced shapes with Line To Line scan lines instead of vector hatching.
- **Where in the UI:** Filling = **Horizontal (old)**, **Vertical (old)** or **Diagonal (old)**.
- **Options & defaults:** Filling Quality and Filling Speed.
- **Behaviour & gotchas:** see [[lg-raster-import]] LG-RAST-21.
  - The shapes are rendered to a bitmap, inset by a white stroke of `max(1, res/fres)` px, resampled to `fres`, and sent through `ImageLine2Line` with skip-white.
  - The block is emitted before the vector borders, with `F{fillSpeed}` and closing `M5`.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImagePotrace`, `RasterFilling`)
- **webgrbl notes:** Status: not started.
  - Keep it for parity. It also suits engraving fills at fine pitch, where vector hatch generates far more G-code than skip-optimised raster.

### LG-VECT-11 Filling quality

- **What it does:** sets the fill line density.
- **Where in the UI:** Vectorize! Options > **Filling Quality** [Lines/mm] (tooltip "Filling quality (lines/mm)") with an info button that opens the Resolution Helper ([[lg-raster-import]] LG-RAST-12). Visible only when Filling ≠ No Filling.
- **Options & defaults:** 0.1–20.000 (50 with HiRes Filling), 3 decimals, default 3.0 (`GrayScaleConversion.VectorizeOptions.FillingQuality`).
- **Behaviour & gotchas:**
  - `fres = min(maxRes, FillingQuality)`, and the line pitch in trace pixels is `res/fres`.
  - Changing it does not refresh the preview (the setter skips `Refresh`).
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`FillingQuality`, `DoTrueWork`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`CbFillingDirection_SelectedIndexChanged`, `BtnFillingQualityInfo_Click`)
- **webgrbl notes:** Status: not started.
  - Show the pitch in mm alongside lines/mm, and refresh the preview on change.

### LG-VECT-12 Vector power, speed and non-PWM behaviour

- **What it does:** sets laser power and feeds for the vector output.
- **Where in the UI:** step 2 **Target image**: Border Speed, Filling Speed, Laser Mode, S-MIN/S-MAX ([[lg-raster-import]] LG-RAST-16…18).
- **Options & defaults:** as in LG-RAST-17/18.
- **Behaviour & gotchas:**
  - With PWM ("Support PWM" on): laser-on is `S{S-MAX}` and laser-off is `S0`, under a preceding `M3 S0` or `M4 S0`. S-MIN is ignored for vectors.
  - Without PWM: the program starts with `M5 S{$30}`, and each path is wrapped in `M3`/`M4` … `M5`.
  - Fill and border share the same power. Only the speeds differ.
  - The size, offset and boundary checks are the same as for raster.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImagePotrace`)
- **webgrbl notes:** Status: not started.
  - Provide separate power for fill and border, and multi-pass per layer.
  - Default to M4 when `$32=1`, so corners do not overburn.

### LG-VECT-13 Centerline tracing (Autotrace)

- **What it does:** extracts single-stroke centrelines from line art (text, signatures, sketches), so each stroke is engraved once instead of as two outlines.
- **Where in the UI:** Conversion Tool > **Centerline** (tooltip "Centerline vectorization"). This shows the **Centerline Options** group. It warns "Centerline option is not compatible with your PC. 64bit OS is needed!" on 32-bit systems but does not block the choice.
- **Options & defaults:**
  - **Line Threshold**: checkbox (default on) + slider 0–100, default 10, double-click resets to 10. It is passed as `value/10` (0.0–10.0 px). Tooltip: "If the spline is not more than this far away from the straight line defined by its endpoints, then output a straight line." Keys `...LineThreshold.Enabled/Value`.
  - **Corner Threshold**: checkbox (default on) + slider 0–360°, default 110, double-click resets to 110. Tooltip: "Angle-in-degrees: if a pixel, its predecessors, and its successors meet at an angle smaller than this, it's a corner." Keys `...CornerThreshold.Enabled/Value`.
  - Shared Parameters, including the B&W threshold.
- **Behaviour & gotchas:**
  - Bitmap: resized at a fixed **10 px/mm**, adjusted, then thresholded: the optional B&W threshold, then an unconditional 50 % threshold.
  - Invocation: the bitmap is saved as PNG to `%DataPath%\Autotrace\<random>.png` and the process is run as `Autotrace\autotrace.exe -output-fo svg -background-color FFFFFF -centerline [-corner-t {deg}] [-line-t {x.x}] "<file>.png"`. The SVG is read from stdout and the PNG is deleted afterwards. The temp folder is cleaned elsewhere (`CleanupTmpFolder`).
  - Autotrace defaults when a flag is omitted: corner-threshold 100°, line-threshold 1.0.
  - Preview: the image is washed 70 % white and the parsed SVG paths are drawn in red. Errors are drawn as centred red text.
  - Usage counter: `Centerline`.
- **Upstream source:** [`LaserGRBL/Autotrace/Autotrace.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Autotrace/Autotrace.cs) (`BitmapToSvgString`, `BitmapToSvgDocument`, `ExecuteAutotrace`, `CleanupTmpFolder`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`PreviewCenterline`, `ProduceBitmap2`). `Autotrace/AutotraceTest.cs` is an unreferenced developer test form.
- **webgrbl notes:** Status: not started.
  - No process spawning in the browser. Options:
    - (a) Compile AutoTrace (C, GPL) to WASM with Emscripten and run it in a worker over an in-memory PNG/PBM. This gives the closest parity.
    - (b) Implement skeletonisation in TS/WASM: Zhang-Suen or Guo-Hall thinning, then pixel-chain tracing, then RDP simplification and spline fitting. That gives full control and no GPL binary.
  - Expose a stroke-width-aware option ("preserve width") and a minimum stroke length.
  - Decouple the 10 px/mm resolution.

### LG-VECT-14 Centerline G-code generation

- **What it does:** converts the Autotrace SVG to G-code with the SVG import engine.
- **Where in the UI:** automatic on **Create!** for the Centerline tool. The step 2 Border Speed applies.
- **Options & defaults:**
  - The converter reads values from **Settings**, which the wizard has just saved:
    - Feed: `GrayScaleConversion.VectorizeOptions.BorderSpeed`
    - Offset: `GrayScaleConversion.Gcode.Offset.X/Y`
    - Laser-on: `...LaserOptions.LaserOn`
    - Power: `...LaserOptions.PowerMax` (S value)
    - Smart Bezier: `Vector.UseSmartBezier`, default on
  - Scaling: `SvgScaleApply = true` with `SvgMaxSize = max(w_px, h_px)/10` mm, which restores the target size.
- **Behaviour & gotchas:**
  - The SVG text goes through `SvgConverter.GCodeFromSVG.convertFromText`. The output lines are trimmed and parsed into the program.
  - The G-code shape, rapid handling ("Disable G0 fast skip"), PWM vs `M3/M5` and Bézier handling follow the SVG converter ([[lg-svg-import]]).
  - Autotrace exceptions are logged, and the result is an empty program.
  - It runs synchronously within the generation thread. It does not use `SafeLoadFile`.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImageCenterline`), [`LaserGRBL/SvgConverter/GCodeFromSVG.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/GCodeFromSVG.cs), [`LaserGRBL/SvgConverter/gcodeRelated.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SvgConverter/gcodeRelated.cs)
- **webgrbl notes:** Status: not started.
  - Pass the conversion options explicitly instead of round-tripping through global settings.
  - Feed the tracer output (paths) directly to webgrbl's shared path-to-G-code module, the same one used by SVG import and Potrace borders, with biarc and travel ordering, instead of serialising to SVG text and parsing it again.

## Upstream Source

- [`LaserGRBL/CsPotrace/CsPotrace.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotrace.cs): Potrace port (binarisation, path decomposition, polygon, smoothing, curve optimisation, static parameters)
- [`LaserGRBL/CsPotrace/CsPotraceExport.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExport.cs): GDI+ rendering of traced paths (preview, raster-fill mask with inset)
- [`LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExportGCODE.cs): traced paths to G-code (G0/G1/G2/G3, laser on/off strings)
- [`LaserGRBL/CsPotrace/PotraceClipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/PotraceClipper.cs): fill pattern generation and Clipper intersection/offset
- [`LaserGRBL/CsPotrace/BezierToBiarc/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/BezierToBiarc): cubic Bézier to biarc approximation (Algorithm, BiArc, Arc, CubicBezier, Line, Vector2, Complex)
- [`LaserGRBL/Clipper/Clipper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Clipper/Clipper.cs): Clipper 6 polygon clipping and offsetting library
- [`LaserGRBL/Autotrace/Autotrace.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Autotrace/Autotrace.cs): wrapper around bundled `autotrace.exe` for centerline tracing
- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs): `LoadImagePotrace`, `LoadImageCenterline`, `OptimizePaths`, `ParallelOptimizePaths`, filling classification
- [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs): vector/centerline preview, tracing resolution, downsampling
- [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs): Vectorize!/Centerline option controls and persisted defaults
