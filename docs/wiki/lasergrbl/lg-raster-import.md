---
title: Raster Image Import (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Raster Image Import

LaserGRBL turns a bitmap (JPG/PNG/BMP/GIF) into a G-code program through a two-step wizard. Step 1, **Import Raster Image**, edits and adjusts the image, picks a conversion tool and shows a live preview. Step 2, **Target image**, sets physical size, position, speed, laser mode and power. This article covers the wizard, the image pipeline, the raster tools (Line To Line, 1-bit Dithering, Passthrough) and the G-code they emit. The vector tools (Vectorize!, Centerline) share the wizard and are documented in [[lg-vectorization]].

## Key Takeaways

- The pipeline always runs in the same order: load as 32bpp ARGB, apply user edits (crop/rotate/flip/invert/fill), resize to `target mm × lines/mm`, run the grayscale ColorMatrix (formula × contrast + brightness), apply White Clip, then the tool step (threshold, dither, or nothing). Transparent pixels always end up white, which means no burn.
- One image pixel is one laser dot. The bitmap is resampled to `W_mm × res` by `H_mm × res` pixels, so the X dot pitch equals the line pitch (`1/res` mm).
- Line To Line maps each pixel to power: `S = (255 − R)·A/255` scaled into `[S-MIN, S-MAX]`, except that pure white is always `S0`. Each run of equal-colour pixels becomes one G-code move with its own `S` word. Coordinates are **absolute**, in mm, with 3 decimals.
- White is always skipped. Runs of `S0` (or `M5` in non-PWM mode) are merged into one `G0` move to the next burn start. The global setting "Disable G0 fast skip" swaps that `G0` for `G1`.
- Line To Line needs the "Support PWM" setting. Without it the radio button is hidden, and Dithering/Vectorize emit per-segment `M3`/`M5` toggles instead of `S` values.
- The preview is computed at picture-box size, not at target resolution. Dithering and line spacing in the preview are only approximate.
- The generated program has no `G90` and no return-to-origin. The custom header, footer and between-passes G-code are added when the job runs or is saved (see [[lg-gcode-files]], [[lg-streaming]]).
- Wizard settings persist globally and are also captured per image into `.lps` projects ([[lg-app-features]]).
- Resolution is capped by memory: max pixels are 22000² on 64-bit and 6000×7000 on 32-bit, and `res = min(res, sqrt(maxPixels / (W·H)))`.

## Features

### LG-RAST-01 Raster file import entry points and formats

- **What it does:** opens a bitmap and starts the raster wizard. The generated program either replaces the loaded program or is appended to it.
- **Where in the UI:** File > Open (replace), File > Append (append), drag-and-drop onto the main form, the command-line argument, File > Reopen last file, and loading an `.lps` project (each image entry restores its settings and reopens the wizard). The open-file filter "Raster Image" lists `*.bmp;*.png;*.jpg;*.jpeg;*.gif`.
- **Options & defaults:** the accepted extensions are `.jpg .jpeg .bmp .png .gif` (`GrblCore.ImageExtensions`). Matching is by extension, case-insensitive.
- **Behaviour & gotchas:**
  - The image is decoded by GDI+ and re-cloned to `Format32bppArgb` to normalise the pixel format. Only the first frame of an animated GIF is used.
  - The file DPI is read from the image metadata (`HorizontalResolution`) and used by Autosize/Passthrough (LG-RAST-15, LG-RAST-16).
  - **Grayscale detection:** every 10th pixel in both axes is sampled. If max(|R−G|, |G−B|, |R−B|) < 20, the image counts as grayscale. The formula combobox is then hidden and the Simple Average formula is forced.
  - Alpha is kept through the adjustments. The threshold step composites the image onto white, and dithering multiplies power by alpha, so transparent areas never burn.
  - An SVG-as-raster path exists in code (SVG rendered at 600 PPI to a temporary PNG) but is disabled: SVG always takes the vector path ([[lg-svg-import]]).
  - The `RasterFile` usage counter is incremented.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OpenFile`, `ImageExtensions`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (constructor, `TestGrayScale`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnFileOpen_Click`, `MnFileAppend_Click`, `MainForm_DragDrop`)
- **webgrbl notes:** Status: not started.
  - Use `<input type=file>`, the File System Access API (`showOpenFilePicker`) where available, drag-drop and the PWA `file_handlers` manifest entry, decoding with `createImageBitmap(blob)`.
  - Add WebP, AVIF and (through a library) TIFF support for free.
  - Add clipboard paste (`navigator.clipboard.read()` / `paste` event), which LaserGRBL lacks.
  - Read DPI from EXIF/pHYs with a small parser, because browsers do not expose it.
  - Decode with `imageOrientation: 'from-image'` so EXIF rotation is applied.

### LG-RAST-02 Wizard flow, live preview and settings persistence

- **What it does:** the modal two-step wizard.
  - Step 1 is the **Import Raster Image** form, with an image toolbar, a Parameters group, a Conversion Tool group and tool-specific option groups. It has two tabs, **Original** and **Preview** (Preview is the converted image), and the buttons **Next** and **Cancel**.
  - **Next** opens step 2, **Target image** (LG-RAST-16/17/18), with **Create!** and **Cancel**.
  - **Create!** stores the settings, locks the UI with a busy indicator, generates G-code on a background thread, and closes the wizard when done. Errors are shown in a message box.
- **Where in the UI:** opens automatically after a raster file is chosen (LG-RAST-01).
- **Options & defaults:** all wizard values persist in the global settings store under `GrayScaleConversion.*` keys. Defaults are given per feature below.
- **Behaviour & gotchas:**
  - Every property change re-runs the preview. A cloned `ImageProcessor` runs on a new thread, and the previous preview thread is signalled and aborted after 100 ms.
  - A spinner appears only if the preview takes long (timer `WT`). **Next** is disabled while a preview is running, and the form cannot be closed while busy.
  - The preview works on `mResized`, a copy fitted to the picture box (box minus 20 px, aspect kept, with the chosen interpolation). It does **not** match the target pixel count.
  - The preview is drawn as a "paper" (white page, gray drop shadow, light-gray border).
  - Resizing the window recomputes the preview.
  - Settings are written to the store and also added to the current project (`Project.AddSettings`) when generation starts.
  - Usage counters are incremented per tool on completion.
- **Upstream source:** [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`LoadSettings`, `GetActualSettings`, `BtnCreateClick`, `OnGenerationComplete`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`Refresh`, `CreatePreview`, `GenerateGCode`, `DoTrueWork`), [`LaserGRBL/Tools/Project.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/Project.cs)
- **webgrbl notes:** Status: not started.
  - Run preview and generation in a Web Worker on an `OffscreenCanvas` or a raw `Uint8ClampedArray`, transferring buffers instead of copying them.
  - Cancel stale previews by generation ID or `AbortController`, debounced about 50 ms.
  - Better than LaserGRBL: render the preview at real target resolution (downscaled for display), or a 1:1 zoomable crop, so dithering and line pitch are honest.
  - Persist settings in IndexedDB as one versioned typed object instead of loose string keys, and allow named presets per material.
  - Make it a non-modal side panel so the machine can still be jogged.

### LG-RAST-03 Image editing toolbar

- **What it does:** destructive edits on the working copy of the image. Each one triggers a preview refresh.
- **Where in the UI:** the toolbar above the preview, with tooltips in parentheses:
  - Rotate 90° CW ("Rotate 90° clockwise")
  - Rotate 90° CCW
  - Flip H ("Flip image horizontal")
  - Flip V ("Flip image vertical")
  - Crop
  - Auto Trim
  - Invert color
  - Flood Fill
  - Outline image
  - Revert ("Revert all changes")
- **Options & defaults:** Crop, Flood Fill and Outliner are mutually exclusive toggle modes; the active one is highlighted.
- **Behaviour & gotchas:**
  - **Rotate:** 90° steps only (`Rotate90FlipNone` / `Rotate270FlipNone`).
  - **Flip naming is confusing.** "Flip H" calls `RotateNoneFlipY`, which mirrors top to bottom, and its icon is `mdi-flip-vertical`. "Flip V" calls `RotateNoneFlipX` (left to right). Decide the semantics explicitly in webgrbl.
  - **Crop:** drag a rectangle on the Preview picture box. It is clamped to the image and scaled back to original pixels. A zero-size rectangle is ignored.
  - **Auto Trim:**
    1. For each of the four borders, check whether the whole edge row or column is one colour (every pixel within ±20 per ARGB channel of the first pixel, averaged).
    2. All uniform edges must be similar to each other. If they are not, nothing happens.
    3. Starting from each side, remove rows/columns while they match the background colour.
    4. Abort if the result would be empty.
  - **Invert:** ColorMatrix negative (RGB → 1−RGB, alpha kept).
  - **Flood Fill:** 4-connected stack fill from the clicked pixel. Tolerance is 127: a channel matches if it is within ±127 of the seed colour, per channel. Left click fills black, right click fills white.
  - **Outliner:** flood-fills the clicked region white (tolerance 127), then paints every pixel **not** reached by the fill black. Clicking the background therefore produces a solid black silhouette of the object.
  - **Revert:** restores the untouched original and undoes all edits at once. There is no step-wise undo.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`RotateCW`, `RotateCCW`, `FlipH`, `FlipV`, `CropImage`, `AutoTrim`, `GuessTrimColor`, `FindLimit`, `Invert`, `Fill`, `Outliner`, `Revert`), [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`InvertingImage`, `Fill4`, `Outline`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (mouse handlers)
- **webgrbl notes:** Status: not started.
  - Keep the edits as a non-destructive operation list replayed on the original. That gives undo/redo for free.
  - Add arbitrary-angle rotation, a crop handle box with aspect presets, and a scanline flood fill (faster than the per-pixel stack).
  - Use Pointer Events for touch and pen crop on tablets.

### LG-RAST-04 Resize interpolation

- **What it does:** chooses the resampling filter used whenever the image is scaled (preview fit and target size).
- **Where in the UI:** Parameters > **Resize** combobox (tooltip "Control resizing mode (Smooth or Hard edges)").
- **Options & defaults:** **Smooth (HQ Bicubic)** (default) or **Sharp (NearestNeighbor)**. Key `GrayScaleConversion.Parameters.Interpolation`.
- **Behaviour & gotchas:**
  - GDI+ `DrawImage` with `PixelOffsetMode.HighQuality` and `WrapMode.TileFlipXY` (avoids dark edge bleed). Compositing is `SourceCopy`, so alpha is preserved.
  - Nearest neighbour suits pixel art and pre-dithered images.
  - Vectorize's downsampling and raster filling always use bicubic.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`ResizeImage`)
- **webgrbl notes:** Status: not started.
  - Canvas `imageSmoothingQuality='high'` is not bicubic and differs between browsers.
  - For deterministic, testable output use a JS/WASM resampler (pica, or a Lanczos/bicubic kernel in a worker), plus nearest-neighbour via `imageSmoothingEnabled=false`.
  - Consider adding area-average (box) filtering for large downscales.

### LG-RAST-05 Grayscale conversion formula

- **What it does:** converts colour to gray with selectable channel weights.
- **Where in the UI:** Parameters > **Grayscale** combobox (tooltip "Select color conversion formula"). Hidden when the image is detected as grayscale. In Custom mode, **Red**, **Green** and **Blue** sliders appear.
- **Options & defaults:** key `GrayScaleConversion.Parameters.Mode`, default SimpleAverage. Sliders R/G/B: 40–160, default 100, double-click resets to 100. Keys `...Parameters.R/G/B`.

  | Formula | R | G | B |
  |---|---|---|---|
  | SimpleAverage | 0.333 | 0.333 | 0.333 |
  | WeightAverage | 0.333 | 0.444 | 0.222 |
  | OpticalCorrect | 0.299 | 0.587 | 0.114 |
  | Custom | 0.333·R/100 | 0.333·G/100 | 0.333·B/100 |

- **Behaviour & gotchas:** applied as one 5×5 ColorMatrix together with contrast and brightness (LG-RAST-06). Gray = `(fR·r + fG·g + fB·b)·contrast + brightness`, normalised 0–1 and clamped. Custom can exceed 1 (overexpose).
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`GrayScale`, `Formula`)
- **webgrbl notes:** Status: not started.
  - A single pass over a `Uint8ClampedArray` in a worker (or a WebGL/WebGPU fragment shader for instant preview).
  - Consider adding a linear-light (sRGB-decoded) luminance option.

### LG-RAST-06 Brightness and contrast

- **What it does:** shifts and scales the gray level before thresholding and dithering.
- **Where in the UI:** Parameters > **Brightness** and **Contrast** sliders.
- **Options & defaults:** both range 40–160 with default 100 (step 1, page 5). Keys `...Parameters.Brightness`, `...Parameters.Contrast`.
- **Behaviour & gotchas:**
  - Brightness offset = `−(100 − B)/100`, a range of −0.6 to +0.6 added in normalised space.
  - "Contrast" is really a **gain** of `C/100` (0.4–1.6) multiplied into the channel weights. It is not a contrast curve around mid-gray, so raising it also brightens the image.
  - Copy the formula exactly for parity, or label it honestly.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`ProduceBitmap2`), [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`GrayScale`)
- **webgrbl notes:** Status: not started.
  - Offer a "LaserGRBL compatible" mode that reproduces this exactly, plus true contrast (pivot at 0.5), gamma and levels/curves. Gamma matters a lot for wood and for nonlinear laser response.
  - Show a histogram.

### LG-RAST-07 White Clip

- **What it does:** treats near-white pixels as pure white, so they produce `S0` and get skipped instead of a faint burn.
- **Where in the UI:** Parameters > **White Clip** slider. While the mouse button is held on it, the preview switches to demo mode and shows clipped pixels in **light pink**.
- **Options & defaults:** 0–100, default 5. Key `GrayScaleConversion.Parameters.WhiteClip`.
- **Behaviour & gotchas:**
  - A colour substitution with threshold T: if every channel lies strictly in `(255−T, 255+T)`, the pixel becomes white with alpha 0 (or pink in demo mode). Fully transparent pixels are left alone.
  - Applied after the grayscale step, so it acts on gray levels above `255 − T`.
  - Important for Line To Line with S-MIN > 0. Only exactly-white pixels map to `S0`; everything else becomes at least S-MIN.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`Whitenize`, `ColorSubstitution`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`ProduceWhitepointDemo`)
- **webgrbl notes:** Status: not started.
  - Keep the hold-to-highlight demo; it is a great affordance. Make it work on touch (press-and-hold) and with keyboard focus.
  - Consider a symmetric "black clip" (force max power).

### LG-RAST-08 B&W threshold

- **What it does:** hard black/white threshold.
- **Where in the UI:** Parameters > **B&W** checkbox (tooltip "Apply threshold filtering") plus a slider shown when it is checked. Hidden for the Dithering tool.
- **Options & defaults:** checkbox default off (`...Parameters.Threshold.Enabled`). Slider 0–100, default 50, double-click resets to 50 (`...Parameters.Threshold.Value`).
- **Behaviour & gotchas:**
  - GDI+ `ImageAttributes.SetThreshold(t/100)` is applied **per channel**: a channel above `t·255` becomes 255, otherwise 0. The image is gray at this point, so the result is pure B/W.
  - The step always composites onto white first, even when unchecked, which turns transparency into white.
  - Line To Line with B&W behaves like on/off engraving at S-MAX.
  - Centerline always applies an extra 50 % threshold. Potrace binarises at 50 % anyway ([[lg-vectorization]]).
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`Threshold`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`RefreshVE`)
- **webgrbl notes:** Status: not started.
  - Add automatic Otsu and adaptive (local mean) thresholds, which are useful for photos of drawings.

### LG-RAST-09 Conversion tool selection

- **What it does:** chooses how the processed bitmap becomes G-code.
- **Where in the UI:** the **Conversion Tool** group (radio buttons):
  - **Line To Line Tracing** ("Produce grayscale image")
  - **1bit BW Dithering** ("Produce grayscale emulated BW image")
  - **Vectorize!** ("Produce vector path")
  - **Centerline** ("Centerline vectorization")
  - **Passthrough** ("No Processing (passthrough)")
- **Options & defaults:** key `GrayScaleConversion.RasterConversionTool`, default `Line2Line`. Passthrough is never persisted: the restore logic falls back to Vectorize for any value other than the first three.
- **Behaviour & gotchas:** the visible option groups depend on the tool.
  - Parameters: hidden for Passthrough.
  - "Line To Line Options": shown for Line2Line and Dithering. Its title switches to "Dithering Options" for Dithering, which adds the dither combobox.
  - "Vectorize! Options": shown for Vectorize.
  - "Centerline Options": shown for Centerline.
  - "Passthrough Options": an info text only.
  - Line To Line is hidden when the "Support PWM" setting is off. If it was the saved tool, Dithering is selected instead, and clicking it shows the warning "Line2Line option is not compatible with your engraver… PWM-able laser is needed".
  - Centerline shows a warning on 32-bit OS but is not blocked.
- **Upstream source:** [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`RefreshVE`, `LoadSettings`, `RbLineToLineTracing_Click`, `RbCenterline_Click`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`Tool` enum)
- **webgrbl notes:** Status: not started.
  - Model the tool as a discriminated union with per-tool option types, so invalid combinations cannot be expressed.
  - Persist Passthrough correctly.

### LG-RAST-10 Line To Line tracing (grayscale power modulation)

- **What it does:** engraves the image as parallel scan lines and modulates laser power per pixel run to reproduce gray levels.
- **Where in the UI:** Conversion Tool > Line To Line Tracing. Its options group holds Direction (LG-RAST-11), Quality (LG-RAST-12) and Line Preview (LG-RAST-13).
- **Options & defaults:** uses S-MIN/S-MAX, Engraving Speed and Laser Mode from step 2 (LG-RAST-17/18).
- **Behaviour & gotchas:**
  - Power per pixel: `v = (255 − R)·A/255` (0 = white). If `v == 0` the power is `S0`; otherwise `S = v·(S-MAX − S-MIN)/255 + S-MIN` (integer division).
  - Adjacent pixels with the same `S` merge into one segment.
  - For Smoothie firmware (Settings > firmware type) the power is printed as `S{v/255:0.00}` (0.00–1.00). That uses the already-scaled value divided by 255, not by S-MAX, which is an upstream quirk.
  - The bitmap is flipped vertically before generation, so image row 0 is the top and maps to the highest Y (Y-up machine coordinates). The image's bottom-left corner sits at the offset.
  - The full emitted shape and pseudo-code are in LG-RAST-20.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImageL2L`, `ImageLine2Line`, `GetSegments`, `ExtractSegment`, `GetColor`, `ColorSegment.FormatLaserPower`)
- **webgrbl notes:** Status: not started.
  - Generate into a string builder or chunked array in a worker. A 200×200 mm job at 10 lines/mm is 4 M pixels and roughly 1–3 M G-code lines, so stream lines to IndexedDB/OPFS instead of holding one giant string.
  - Ideas: an optional gamma/response curve between pixel and S; overscan (lead-in/out at speed) to remove dark edges from acceleration; a per-line `S` quantisation step to cut line count.

### LG-RAST-11 Engraving direction and unidirectional mode

- **What it does:** sets the scan pattern for Line To Line and Dithering.
- **Where in the UI:** Line To Line/Dithering Options > **Direction** (tooltip "Engraving direction").
- **Options & defaults:** **Horizontal** (default), **Vertical**, **Diagonal**. These are the "(old)" raster directions; the labels are shown without the suffix here. Key `GrayScaleConversion.Line2LineOptions.Direction`. The global setting **Unidirectional Engraving** ("Unidirectional Engraving", default off) applies too.
- **Behaviour & gotchas:**
  - **Horizontal:** one line per pixel row, bidirectional serpentine (even rows left→right, odd rows right→left). Lines are joined by a 1-pixel `Y` step (`VSeparator`).
  - **Vertical:** the same per pixel column, with `X` steps between columns (`HSeparator`).
  - **Diagonal:** 45° strips (`slice = 0 … W+H−2`), alternating direction. Each segment moves `+X` and `−Y` by the same amount, so the perpendicular pitch is `1/(res·√2)` mm. Strip-to-strip steps switch between X and Y separators depending on which part of the rectangle is being scanned. The traversal is based on the StackOverflow "diagonal strips" algorithm.
  - **Unidirectional:** every line is scanned in the same direction and followed by a full-length white "go back" segment. The skip optimiser collapses it into a `G0`. This roughly doubles travel but removes backlash/zig-zag offset.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`GetSegments`, `XSegment`, `YSegment`, `DSegment`, `VSeparator`, `HSeparator`, `RasterFilling`)
- **webgrbl notes:** Status: not started.
  - Ideas: arbitrary scan angle; a bidirectional line-offset (backlash/latency) compensation in mm, which fixes the "ghosting" users otherwise solve with unidirectional mode; skipping fully-white lines entirely (LaserGRBL still emits the Y step, though it is merged into the G0).

### LG-RAST-12 Quality (lines/mm) and Resolution Helper

- **What it does:** sets the raster resolution, which is both line spacing and dot pitch.
- **Where in the UI:** Line To Line/Dithering Options > **Quality** [Lines/mm] numeric field (tooltip "Set image resolution (lines/mm)"). The info button next to it opens the **Resolution Helper** dialog.
- **Options & defaults:**
  - Quality: 1.000–20.000 lines/mm, 3 decimals, default 3.0. The maximum is 50 when the global setting **HiRes Filling** (`Raster Hi-Res`) is on. Key `GrayScaleConversion.Line2LineOptions.Quality`.
  - Resolution Helper fields:
    - "Desired resolution" (1–20/50, prefilled with the current Quality)
    - "$100 Hardware Resolution" [steps/mm] (0.1–10000, prefilled from `$100`)
    - "Computed resolution" (read-only)
  - Resolution Helper buttons: **Set** and **Cancel**, plus a help link.
- **Behaviour & gotchas:**
  - The helper computes `computed = hw / round(hw / desired)`, so the line pitch is a whole number of motor steps (avoids moiré/banding), clamped to the min/max using ceil/floor variants. **Set** writes the value back and stores `Hardware Resolution`.
  - The target bitmap is `round_down(W_mm·res) × round_down(H_mm·res)` px.
  - The effective res is clamped by memory: `maxPixels` is `22000·22000` on 64-bit or `6000·7000` on 32-bit, and `res = min(res, sqrt(maxPixels/(W_mm·H_mm)))`. If res ≤ 0 the error "Target size too big for processing!" is raised.
- **Upstream source:** [`LaserGRBL/RasterConverter/ResolutionHelperForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ResolutionHelperForm.cs) (`Compute`, `MaxRes`, `MinRes`), [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`DoTrueWork`), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`GetMaxQuality`, `BtnQualityInfo_Click`)
- **webgrbl notes:** Status: not started.
  - Browser canvas limits (about 16 k per side or roughly 268 M px in Chrome, less on iOS Safari) and memory pressure are stricter than desktop .NET. Process in row strips with typed arrays instead of a single canvas.
  - Derive the cap from `navigator.deviceMemory` and show the resulting dot pitch (µm) and DPI next to lines/mm.
  - Integrate the step-snap suggestion inline, using `$100`/`$101` read from the connected machine ([[lg-grbl-configuration]]).
  - Allow different X and Y resolutions.

### LG-RAST-13 Line Preview overlay

- **What it does:** overlays thin white stripes on the preview to suggest the scan direction.
- **Where in the UI:** Line To Line/Dithering Options > **Line Preview** checkbox (tooltip "Show preview").
- **Options & defaults:** default off (`GrayScaleConversion.Line2LineOptions.Preview`).
- **Behaviour & gotchas:**
  - Purely cosmetic: white lines every 2 px (Horizontal/Vertical) or every 3 px (Diagonal) at picture-box scale. Alpha is 200 (L2L) or 100 (Dithering); diagonal lines use 255 or 150.
  - It does **not** show the real line density.
  - Passthrough always shows horizontal stripes. The vector filling preview reuses the same routine ([[lg-vectorization]]).
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`PreviewLineByLine`)
- **webgrbl notes:** Status: not started.
  - Replace it with a true simulated-burn preview at target resolution, zoomable: draw each segment with opacity = S/S-MAX. That doubles as an estimate of the final look, and the generated toolpath can be reused for [[lg-preview]].

### LG-RAST-14 1-bit dithering

- **What it does:** converts gray to pure black/white dots by error diffusion, emulating grayscale on lasers without PWM or on materials with a narrow tonal range.
- **Where in the UI:** Conversion Tool > **1bit BW Dithering**. The options group is titled "Dithering Options" and has a **Dithering** combobox plus Direction, Quality and Line Preview (shared with LG-RAST-11/12/13). The B&W threshold is hidden.
- **Options & defaults:** algorithm key `GrayScaleConversion.DitheringOptions.DitheringMode`, default **FloydSteinberg**. Names are shown untranslated: Atkinson, FloydSteinberg, Burks, Jarvis, Random, Sierra2, Sierra3, SierraLight, Stucki.
- **Behaviour & gotchas:**
  - The input is the white-clipped gray bitmap at target resolution (alpha preserved; transparent pixels never burn).
  - Pixels are visited in raster order (left→right, top→bottom; no serpentine). Each one is quantised with `gray = 0.299R + 0.587G + 0.114B` (byte), giving 0 if `gray < 128` and 255 otherwise.
  - The error `orig − new` is diffused to neighbours with the kernel below. Kernel position `*` is the current pixel and only cells to its right or on later rows receive error. Each neighbour gets `err·w >> shift` or `err·w / div`, clamped to 0–255.
  - Then Line To Line runs on the dithered bitmap. With PWM, black becomes S-MAX and white `S0`. Without PWM, black is `M3` and white `M5`.

  | Algorithm | Kernel rows (`*` = current pixel; `.` = ignored) | Divisor |
  |---|---|---|
  | FloydSteinberg | `. * 7` / `3 5 1` | 16 (>>4) |
  | Atkinson | `. * 1 1` / `1 1 1 .` / `. 1 . .` | 8 (>>3): diffuses only 6/8 of the error |
  | Burks (Burkes) | `. . * 8 4` / `2 4 8 4 2` | 32 (>>5) |
  | Jarvis (Jarvis-Judice-Ninke) | `. . * 7 5` / `3 5 7 5 3` / `1 3 5 3 1` | 48 |
  | Stucki | `. . * 8 4` / `2 4 8 4 2` / `1 2 4 2 1` | 42 |
  | Sierra3 | `. . * 5 3` / `2 4 5 4 2` / `. 2 3 2 .` | 32 (>>5) |
  | Sierra2 (two-row) | `. . * 4 3` / `1 2 3 2 1` | 16 (>>4) |
  | SierraLight (Sierra Lite) | `. * 2` / `1 1 .` | 4 (>>2) |
  | Random | no diffusion: white if `gray > rand(0..254)`, else black (opaque) | n/a |

- **Upstream quirks (reproduce or fix knowingly):**
  - The bounds check uses `offsetX > 0 && offsetY > 0`, so column 0 and row 0 never receive diffused error.
  - The G and B error variables are swapped. This is harmless because the input is gray.
  - Random seeds with `Environment.TickCount`, so the output is not reproducible.
  - Random sets alpha to 255. White-clipped pixels are already white, so they still do not burn.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs) (`DitherImage`, `TransformPixel`, `GetDitheringMode`), [`LaserGRBL/RasterConverter/Dithering/ErrorDiffusionDithering.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/Dithering/ErrorDiffusionDithering.cs) (`Diffuse`), kernels in the same folder (`FloydSteinbergDithering.cs`, `AtkinsonDithering.cs`, `BurkesDithering.cs`, `JarvisJudiceNinkeDithering.cs`, `StuckiDithering.cs`, `Sierra3Dithering.cs`, `Sierra2Dithering.cs`, `SierraLiteDithering.cs`, `RandomDithering.cs`). The code is derived from Cyotek's dithering sample.
- **webgrbl notes:** Status: not started.
  - Error diffusion is sequential per image. Run it in a worker on a `Float32Array` (or `Int16Array`) for precision instead of re-clamping bytes, and keep the WASM option open for very large images.
  - Fix the row/column-0 bug.
  - Add serpentine scanning (reduces worm artefacts), ordered/Bayer and blue-noise dithering (parallelisable, GPU-friendly), halftone dots with an angle, and a seeded RNG for Random so results are reproducible.
  - Let the dot size or kerf drive resolution suggestions.

### LG-RAST-15 Passthrough (no processing)

- **What it does:** engraves the image exactly as stored: no adjustments, native pixel grid, file DPI.
- **Where in the UI:** Conversion Tool > **Passthrough**. The "Passthrough Options" group only shows the text: "Passthrough mode leaves the image intact, without any processing by LaserGRBL. The image will be engraved line by line, horizontally, according to the size and DPI resolution contained in file information."
- **Options & defaults:** none in step 1. In step 2, Autosize is forced on, DPI is loaded from the file, and both are disabled.
- **Behaviour & gotchas:**
  - Gray = SimpleAverage with no brightness/contrast. White clip is not applied.
  - Pixel size = original pixels and `res = FileDPI/25.4` px/mm. The filling resolution is the same.
  - Direction is forced to Horizontal. The output is then Line To Line with S-MIN/S-MAX scaling (PWM) or on/off (no PWM).
  - Images with a wrong or default DPI (often 96 or 72) produce surprising sizes.
- **Upstream source:** [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs) (`ProduceBitmap2`, `DoTrueWork`), [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs) (`InitImageSize`)
- **webgrbl notes:** Status: not started.
  - Browsers do not expose DPI, so parse PNG `pHYs` and JPEG JFIF/EXIF. Warn when the DPI is missing or 72/96, and offer manual DPI entry.
  - Ideal for images pre-processed in external tools (e.g. "ImagR"-style prepared PNGs).

### LG-RAST-16 Target size and position

- **What it does:** sets the physical size and placement of the output on the machine.
- **Where in the UI:** step 2 **Target image** > group "Image Size and Position [mm]".
- **Options & defaults:**
  - **Size W / H** [mm]: 1 decimal, min 10, max = table width/height (`$130`/`$131`, fallback 1000). The default is 100 mm on the longer side (W if landscape, else H), with the other side from the aspect ratio. Keys `GrayScaleConversion.Gcode.ImageSize.W/H`.
  - **Lock/Unlock proportion** button: locked by default. Unlocking asks for confirmation ("Freely assigning the width and height… distortion"). The lock state is remembered for the session only (static).
  - **Autosize** checkbox with **DPI** field (1–10000, default 300): when checked, W/H are disabled and `W = 25.4 · pixels_w / DPI`, H by ratio. The **Load DPI from Exif** button (`BtnDPI`) is enabled only when the DPI differs from the file DPI.
  - **Offset X / Y** [mm]: 1 decimal, default 0. The range is `0…table` when soft limits are on (`$20=1`), else `−table…table`. Keys `GrayScaleConversion.Gcode.Offset.X/Y`.
  - **Center** button: sets offset = (−W/2, −H/2), which puts the job origin at the image centre.
  - **Reset** button: sets the offset to 0,0.
- **Behaviour & gotchas:**
  - On **Create!**, unless the global "Disable boundary warn" setting is on, two confirmations may appear:
    - A negative offset with soft limits enabled asks "…negative offsets, but your engraver is set to use positive space with soft limit alarm enabled ($20=1)…".
    - If `max(offset,0) + size` exceeds `$130`/`$131`, it asks "…larger than the workspace configured in your engraver ({w}mm x {h}mm)…".
  - Out-of-range `$130`/`$131` show an error box.
  - Offset is the bottom-left corner of the image in machine coordinates.
- **Upstream source:** [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs) (`AssignMinMaxLimit`, `InitImageSize`, `ComputeDpiSize`, `BtnCenter_Click`, `BtnReset_Click`, `ConfirmOutOfBoundary`, `BtnUnlockProportion_Click`)
- **webgrbl notes:** Status: not started.
  - Ideas: a 9-point anchor selector instead of only bottom-left/centre; placing and scaling the image visually on a workspace canvas (drag and resize over the table outline, like LightBurn).
  - Read table size and soft-limit flag live from the connected machine's `$$`.
  - Remember the aspect-lock choice persistently.

### LG-RAST-17 Speed settings and material database

- **What it does:** sets feed rates for the generated G-code.
- **Where in the UI:** step 2 group **Speed**:
  - **Engraving Speed** (labelled "Filling Speed" for Vectorize) [mm/min]
  - **Border Speed** [mm/min]
  - A DB button ("Open Laser & Material DB")
- **Options & defaults:** both 1…`$110` (max X rate, fallback 20000; designer max 4000), default 1000.
  - Engraving/Filling Speed (key `GrayScaleConversion.Gcode.Speed.Mark`) is visible for Passthrough, Line2Line, Dithering, and Vectorize with a filling.
  - Border Speed (key `GrayScaleConversion.VectorizeOptions.BorderSpeed`) is visible for Vectorize and Centerline.
- **Behaviour & gotchas:**
  - Line To Line puts the speed on its first move, `G0 X{oX} Y{oY} F{speed}`. It then relies on modal `F` for both G0 and G1 (GRBL ignores F on G0).
  - The material DB (PSHelper) sets the visible speed fields and `S-MAX = S-MAX.max · power% / 100` ([[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs) (`ShowDialog`, `BtnPSHelper_Click`), [`LaserGRBL/PSHelper`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PSHelper)
- **webgrbl notes:** Status: not started.
  - Allow mm/s units (LightBurn users expect them).
  - Show the estimated job time live from segment lengths and `$120` acceleration.
  - Make the material DB editable and shareable (JSON import/export).

### LG-RAST-18 Laser mode (M3/M4) and power range (S-MIN/S-MAX)

- **What it does:** chooses the laser-on command and the PWM range that gray maps onto.
- **Where in the UI:** step 2 group **Laser Options**:
  - **Laser Mode** combobox: "M3 - Constant Power" or "M4 - Dynamic Power", with an info button.
  - **S-MIN** and **S-MAX** numeric fields with live percentage labels (value/`$30`, "P1" format), and a modulation info button.
- **Options & defaults:**
  - Laser Mode: key `GrayScaleConversion.Gcode.LaserOptions.LaserOn`, default `M3`. The laser-off command is fixed to `M5`.
  - S-MIN: 0–999, default 0 (`...PowerMin`).
  - S-MAX: 1…`$30` (fallback 1000), default `$30` (`...PowerMax`).
  - Editing one keeps `S-MIN < S-MAX` by pushing the other value (±1).
  - S-MIN, S-MAX and the percentages are hidden when "Support PWM" is off.
- **Behaviour & gotchas:**
  - If the machine has `$32=0` (laser mode off), M3 is pre-selected regardless of the saved value.
  - Choosing M4 with `$32=0` warns: "'M4 Dynamic Laser Power Mode' has been set, but your engraver doesn't seem to support it. Only engravers with grbl version >= 1.1 with 'laser mode' enabled ($32=1)…".
  - **With PWM:** the program starts with `M3 S0` / `M4 S0` and power is carried by `S` words.
  - **Without PWM:** the program starts with `M5 S{$30}`, so the maximum spindle value is preloaded, and power is toggled per segment with `M3`/`M4` (on) and `M5` (off). Pixels with value ≤ 125 (light) count as off.
- **Upstream source:** [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs) (`CBLaserON_SelectedIndexChanged`, `IIMinPowerCurrentValueChanged`, `IIMaxPowerCurrentValueChanged`, `RefreshPerc`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`ColorSegment.Fast`, `LoadImageL2L`)
- **webgrbl notes:** Status: not started.
  - Default to M4 when `$32=1`. M4 scales power with speed during acceleration, which gives much better rasters.
  - Express power in % of `$30` in the UI and convert at generation time.
  - Support firmware flavours (grblHAL, FluidNC, Smoothie 0–1 scale) through one formatter.

### LG-RAST-19 White skip and fast-skip optimisation

- **What it does:** avoids slow travel over blank areas by turning runs of `S0` (or `M5`) moves into a single rapid to where burning resumes.
- **Where in the UI:** always on. The global setting **Disable G0 fast skip** (default off) uses `G1` instead of `G0` for skips (for machines that misbehave with `G0` in laser mode or when M4 power drops are undesirable). **Unidirectional Engraving** also relies on this optimisation (LG-RAST-11).
- **Options & defaults:** settings `Disable G0 fast skip` = false, giving skip command `G0`.
- **Behaviour & gotchas:**
  - A post-pass (`OptimizeLine2Line`) walks the command list and keeps a "cumulate" flag. With PWM, any command with `S0` sets it and any `S>0` clears it. Without PWM, `M5` sets it and `M3`/`M4` clears it.
  - While cumulating, **movement** commands are dropped and only the last X/Y is tracked. Non-movement commands such as a bare `S0` are kept.
  - When cumulation ends, `G0 X{lastX} Y{lastY} S0` is inserted first (`... M5` without PWM), followed by the burning command, which already carries `G1`.
  - Result: blank stretches, row changes and unidirectional returns all collapse into one rapid. White borders around the image are skipped too.
  - Only pixels that are exactly white (after White Clip) count as blank.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`OptimizeLine2Line`, `ImageLine2Line`, `skipcmd`)
- **webgrbl notes:** Status: not started.
  - Add a minimum skip length: short white gaps are faster at G1 than with decel, rapid and accel.
  - Add overscan margins so lines start at speed.
  - Make skipping fully-white rows explicit.

### LG-RAST-20 Generated G-code format (raster tools)

- **What it does:** defines the exact output of Line To Line, Dithering and Passthrough.
- **Where in the UI:** the result replaces (Open) or is appended to (Append) the loaded program and appears in the preview and editor ([[lg-gcode-files]], [[lg-preview]]).
- **Options & defaults:** see LG-RAST-10…19.
- **Behaviour & gotchas:**
  - Coordinates are absolute mm: `round(pixelIndex/res + offset, 3)`, InvariantCulture, no trailing zeros (`0.###`). The generator does not emit `G90`; it relies on the custom header, whose default is `G90 (use absolute coordinates)`. Nothing returns to origin; the default footer is `G0 X0 Y0 Z0`.
  - Header, footer and between-passes code are injected when the job is run or saved, not stored in the program. The number of passes is set at run/save time ([[lg-streaming]], [[lg-gcode-files]]).
  - A `G` word is emitted only when switching between skip and burn. Continuation lines are bare (`X12.3 S180`), relying on modal G1.
  - Example (PWM, Horizontal, res 10, offset 0,0, speed 1000, M3):

    ```gcode
    G0 X0 Y0 F1000
    M3 S0
    G0 X1.2 Y0 S0      ; inserted by skip optimiser
    G1 X1.5 S412       ; first burn run
    X1.9 S730
    X2.3 S1000
    S0                 ; laser off before line change
    G0 X2.6 Y0.1 S0    ; collapsed skip + row change
    G1 X2.2 S655       ; reverse direction on odd row
    ...
    M5
    ```

  - Pseudo-code:

    ```text
    bmp = flipVertical(targetBitmap)                       // Y up
    emit "{skip} X{oX} Y{oY} F{markSpeed}"
    emit pwm ? "{lOn} S0" : "M5 S{$30}"
    segs = []
    for line i in rows (or cols / diagonals):
        forward = unidirectional || i even
        walk pixels in direction; group equal power -> seg(power, len, forward)
        if unidirectional: seg(0, lineLen, reverse)            // go back
        if not last line: separator(1px step on other axis)
    fast = true; cum = (0,0)
    for s in segs:
        if s.separator and !fast: tmp += pwm ? "S0" : "M5"
        changed = fast != s.isBlank        // blank: pwm ? power==0 : power<=125
        fast = s.isBlank
        cum += s.len * axis(s)                          // X, Y, or (+X,-Y)
        coord = round(cum/res + offset, 3)
        word = pwm ? "S{power}" : (fast ? "M5" : lOn)   // separators: coord only
        tmp += (changed ? (fast ? skip : "G1") + " " : "") + coord + " " + word
    out += collapseBlankRuns(tmp)                       // LG-RAST-19
    emit "M5"
    ```

  - Generation runs on a background thread. `Analyze()` then computes bounds and time ([[lg-preview]]). The wizard closes on completion, and an exception message (other than abort) is shown in a message box.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImageL2L`, `ImageLine2Line`, `OptimizeLine2Line`, `ColorSegment.formatnumber`, `SaveGCODE`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GCODE_STD_HEADER`, `GCODE_STD_FOOTER`, `GCODE_STD_PASSES`)
- **webgrbl notes:** Status: not started.
  - Write the generator as a pure TS function `(gray: Uint8Array, w, h, conf) => Iterable<string>` (a generator function) so it is unit-testable against golden files produced from LaserGRBL.
  - Stream the output to the sender without materialising it all.
  - Emit an explicit `G90 G21` preamble option, so the program does not depend on the header.
  - Consider GRBL's laser-mode-friendly compact output (omitting repeated `S`), and an optional "relative per line" mode to shorten lines.

### LG-RAST-21 Raster filling of vectorized shapes

- **What it does:** when Vectorize! uses one of the "(old)" filling directions (Horizontal/Vertical/Diagonal), the traced shapes are filled with the Line To Line engine at the filling resolution instead of vector hatch lines.
- **Where in the UI:** Vectorize! Options > **Filling** = "Horizontal (old)" / "Vertical (old)" / "Diagonal (old)", plus **Filling Quality** [Lines/mm] (LG-VECT feature in [[lg-vectorization]]).
- **Options & defaults:** Filling Quality 0.1–20 (50 with HiRes Filling), default 3 (`GrayScaleConversion.VectorizeOptions.FillingQuality`). The filling speed is the Engraving/Filling Speed.
- **Behaviour & gotchas:**
  1. The traced paths are drawn filled black on a bitmap at vector resolution.
  2. They are stroked white with a pen of width `max(1, res/fres)` px, so the fill stops short of the border.
  3. The bitmap is bicubic-resampled to `fres` (+1 px) and fed to `ImageLine2Line` with coordinates divided by `fres`.
  4. The emitted block is `{lOn} S0` (or `M5 S{$30}`), `F{markSpeed}`, the L2L lines, then `M5`. The border G-code follows.
  - Antialiased edges get intermediate S values, scaled between S-MIN and S-MAX.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadImagePotrace`, `L2LConf.vectorfilling`), [`LaserGRBL/CsPotrace/CsPotraceExport.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CsPotrace/CsPotraceExport.cs) (`Export2GDIPlus`)
- **webgrbl notes:** Status: in progress. Fill of vector shapes shipped in [[layers-and-gcode]], with exact scanline-polygon intersection instead of a raster: a Fill layer engraves its shapes line by line at the layer's line interval, with nonzero or even-odd parity, paint order, overscan, and gradient or grey power. Filling traced bitmaps (Vectorize!) does not exist yet. Original proposal:
  - Reuse the same L2L generator. Rasterise the paths with `Path2D` on an `OffscreenCanvas` (with antialiasing off for crisp on/off edges).
  - Prefer exact scanline-polygon intersection (vector hatch) for sharper edges when quality matters.

## Upstream Source

- [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs): step-1 wizard UI, settings load/store, tool switching, crop/fill/outline mouse handling
- [`LaserGRBL/RasterConverter/RasterToLaserForm.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.Designer.cs): control ranges and defaults (labels in `RasterToLaserForm.resx`)
- [`LaserGRBL/RasterConverter/ImageProcessor.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageProcessor.cs): image state, edits, preview threading, processing pipeline, resolution selection, dispatch to generators
- [`LaserGRBL/RasterConverter/ImageTransform.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ImageTransform.cs): resize, grayscale ColorMatrix, threshold, white clip, invert, flood fill, outliner, dithering driver
- [`LaserGRBL/RasterConverter/Dithering/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/Dithering): error-diffusion kernels (Cyotek-derived)
- [`LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ConvertSizeAndOptionForm.cs): step-2 size/offset/speed/laser options and boundary checks
- [`LaserGRBL/RasterConverter/ResolutionHelperForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/ResolutionHelperForm.cs): step-aligned resolution calculator
- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs): `LoadImageL2L`, `ImageLine2Line`, `GetSegments`, `OptimizeLine2Line`, segment classes, `GetColor`
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs): file-type dispatch, default header/footer/passes
- [`LaserGRBL/Settings.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Settings.cs): key/value settings store holding `GrayScaleConversion.*` and global flags (`Support Hardware PWM`, `Unidirectional Engraving`, `Disable G0 fast skip`, `Raster Hi-Res`, `DisableBoundaryWarning`)
