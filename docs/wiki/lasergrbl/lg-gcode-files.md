---
title: G-code Files and Projects (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# G-code Files and Projects

How LaserGRBL gets a job into memory and back out to disk: the open/append/reload flow and its file-type dispatch, drag-and-drop and command-line opening, the G-code parser and program analysis (bounding box, modal state, time estimate), quick and advanced G-code export with header/footer/passes, and `.lps` project files. Image and SVG conversion are covered in [[lg-raster-import]], [[lg-vectorization]] and [[lg-svg-import]].

## Key Takeaways

- **One in-memory program** (`GrblFile`: a flat `List<GrblCommand>`). Every importer (G-code, raster, SVG, generators) produces lines into it. "Append" concatenates and there is no object/layer model. After any load the whole list is re-analysed.
- **Supported extensions are exact:** G-code `.nc .cnc .tap .gcode .ngc`; raster `.jpg .jpeg .bmp .png .gif`; vector `.svg`; project `.lps`. **`.txt`, `.gc`, `.g`, `.nc` variants like `.ncc` are rejected** with "Unsupported file type".
- **Lines are normalised on load:** trimmed, blank lines dropped, **upper-cased**, and (once parsed) comments `(...)` and `;...` stripped and runs of spaces collapsed. Saving writes this normalised text, so it is not byte-identical to the source.
- **Analysis models only part of GRBL:** G90/G91, G92 offsets, G0/G1/G2/G3 (I/J and an approximate R), G4 dwell, M3/M4/M5, F, S. **G20 (inches) is tracked but ignored**: inch files preview and estimate as if mm. G53/G28/G30/G10 are not modelled.
- **Time estimate is naive:** distance / feed (G1-G3, capped at `$110`) or distance / `$110` (G0), plus G4 dwell. No acceleration, no `$111` Y rate, no overrides. During a run the status bar switches to a *projected* time scaled by real progress.
- **Saving:** Quick Save (Ctrl+S) writes the raw program. "Save (Advanced Options)" can add custom header, footer, between-pass code, repeat N passes and use LF line endings. The save filter is `.nc` only.
- **`.lps` projects only remember raster imports** (settings + embedded original image), stored with .NET `BinaryFormatter`. webgrbl cannot read them without an MS-NRBF parser and should define its own JSON format.
- **No recent-files list**: only "Reload Last File" (one entry, `Core.LastOpenFile`).
- **Hershey** is an internal single-stroke font used only for the labels of the built-in test generators. It is not a user "add text" feature.

## Features

### LG-GCODE-01 Open file and type dispatch

- **What it does:** Shows an open dialog (or takes a given path), remembers it as the last file, and routes it by extension: raster → raster import dialog, `.svg` → SVG import, G-code → direct load, `.lps` → project restore. Anything else → "Unsupported file type" error box.
- **Where in the UI:** File > Open File (hotkey **Ctrl+O**), toolbar/menu icon "folder".
- **Options & defaults:**
  - Dialog filter, in order: `Any supported file|*.nc;*.cnc;*.tap;*.gcode;*.ngc;*.bmp;*.png;*.jpg;*.jpeg;*.gif;*.svg;*.lps`, `GCODE Files|*.nc;*.cnc;*.tap;*.gcode;*.ngc`, `Raster Image|*.bmp;*.png;*.jpg;*.jpeg;*.gif`, `Vector Image (experimental)|*.svg`, `LaserGRBL Project|*.lps`.
  - Single selection. Pre-selects the last opened file if it still exists. `RestoreDirectory` on.
- **Behaviour & gotchas:**
  - Disabled while a job runs or a load is in progress (`CanLoadNewFile = !InProgram && !file.CheckInUse`).
  - The menu item clears the pending project settings (`Project.ClearSettings`) first. **The Ctrl+O hotkey does not**, so project contents can leak between sessions (see LG-GCODE-10).
  - Extension matching uses `Path.GetExtension(...).ToLowerInvariant()`.
  - Usage counters are incremented per type (telemetry; see [[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OpenFile`, `ImageExtensions`, `GCodeExtensions`, `ProjectFileExtensions`, `CanLoadNewFile`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnFileOpen_Click`), [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs)
- **webgrbl notes:** Status: not started. Use `showOpenFilePicker` (File System Access API, Chromium) with `types` mirroring the filters, falling back to `<input type=file>`. Keep the `FileSystemFileHandle` so reload/save-back works without a new prompt (persist it in IndexedDB; ask again with `requestPermission`). Accept more G-code extensions (`.txt`, `.gc`, `.g`, `.nc*`), or sniff the content. Show errors in the UI, not only in a log.

### LG-GCODE-02 Append file to the current program

- **What it does:** Opens any supported file and adds its commands after the existing program instead of replacing it.
- **Where in the UI:** File > Append File ("folder-plus" icon). Same dialog and dispatch as Open.
- **Options & defaults:** None. Raster/SVG append goes through their usual dialogs with `append=true`.
- **Behaviour & gotchas:**
  - No offset or placement: appended code runs at its own coordinates.
  - Modal state carries over from the previous file's end (e.g. a trailing G91 or M5 affects the appended part). There is no reset between parts.
  - Range and time are recomputed over the whole list.
  - Append does not clear project settings, so raster appends add entries to the project (LG-GCODE-10).
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadFile(filename, append)`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnFileAppend_Click`)
- **webgrbl notes:** Status: not started. Model the job as an ordered list of objects (G-code blocks, images, vectors), each with a transform and enable/order controls, and generate the final stream on Send. If raw concatenation is kept, insert a modal reset (`G90 G21 M5`) between parts.

### LG-GCODE-03 Reload last file

- **What it does:** Re-runs Open on `Core.LastOpenFile` (re-opening the import dialog for images/SVG).
- **Where in the UI:** File > Reload Last File (hotkey **Ctrl+R**). Enabled only if the file still exists and loading is allowed.
- **Options & defaults:** Setting `Core.LastOpenFile` (full path; also set by every Open/Append and by project restore).
- **Behaviour & gotchas:** This is the only "recent file" feature; there is no MRU list. The menu item clears project settings, the hotkey does not.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ReOpenFile`, `CanReOpenFile`)
- **webgrbl notes:** Status: not started. Add a real recent-files list (e.g. 10 entries) from stored `FileSystemFileHandle`s in IndexedDB, plus a copy of the file content (OPFS) so reload works even without handle permission or in browsers without the File System Access API.

### LG-GCODE-04 Drag-and-drop and command-line opening

- **What it does:** Opens a file dropped on the main window, or one passed as the only command-line argument (e.g. Explorer "Open with" / file association).
- **Where in the UI:** Main window drop target; `LaserGRBL.exe <file>`.
- **Options & defaults:**
  - Drop: exactly **one** file (multi-file drops are ignored). It always replaces the program (no append). Opening is delayed 0.5 s on a dispatcher timer so the drag source (Explorer) is released first.
  - Command line: exactly one argument naming an existing file. `.zbn` (zipped custom buttons) → import buttons ([[lg-machine-control]] / [[lg-app-features]]); otherwise `OpenFile(file)`. If loading isn't allowed now, a "cannot open file now" message is shown. Arguments `nogl`/`swgl` force the GDI / software-GL preview ([[lg-preview]]).
- **Behaviour & gotchas:** A dropped `.zbn` is *not* treated as buttons; it gives "Unsupported file type". There is no single-instance forwarding: a second launch with a file starts a second app.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MainForm_DragEnter`, `MainForm_DragDrop`, `dropDispatcherTimer_Tick`, `ManageCommandLineArgs`), [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs)
- **webgrbl notes:** Status: in progress. Dropping SVG files on the bed imports them ([[projects-and-svg-import]]). Not yet: other file types, a drop overlay, command-line or `file_handlers` opening. Original proposal: Drag-and-drop: HTML5 `dragover`/`drop` on the whole app with a visible drop overlay. Use `DataTransferItem.getAsFileSystemHandle()` to keep a writable handle, and support multi-file drop (append the rest). For OS association, declare `file_handlers` in the PWA manifest (`.nc .gcode .ngc .tap .cnc .txt .svg .png .jpg .jpeg .bmp .gif`, plus webgrbl's own project extension) and read `window.launchQueue.setConsumer(...)`. `launch_handler: {client_mode: "focus-existing"}` gives single-instance behaviour.

### LG-GCODE-05 G-code file loading and line normalisation

- **What it does:** Reads a G-code text file line by line into `GrblCommand` objects on a background thread, then analyses it.
- **Where in the UI:** Any G-code open/append. While loading, the preview shows "Loading…" ([[lg-preview]]).
- **Options & defaults:** None. Encoding is `StreamReader` auto-detect (UTF-8 default, BOM honoured).
- **Behaviour & gotchas:**
  - Each line is `Trim()`med; empty lines are dropped. Every line is **upper-cased** (`GrblCommand(line)` with `preservecase=false`).
  - During parsing (`BuildHelper`), lines not starting with `$` are tokenised. `;` ends the line; `(`…`)` is skipped; consecutive spaces collapse to one. **The stored text is replaced by this cleaned version**, so comments disappear from the job list and from saved files. A comment-only line stays in the list as an empty command.
  - Tokens: a letter starts a word and digits, `.` and `-` accumulate its number (invariant culture). Words are stored in a per-letter dictionary, so a **repeated letter on one line keeps only the last value** (e.g. `G90 G1 X1` keeps G1). Two G-codes on one line are not both modelled; only the last affects the analysis.
  - `$` lines (GRBL system commands) are kept verbatim and not parsed.
  - Parse failures are swallowed: the line keeps whatever words were parsed before the error.
  - "Already loading" message if a load is in progress (`CheckInUse`).
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`LoadFile`, `SafeLoadFile`, `CheckInUse`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GrblCommand(string)`, `BuildHelper`, `IsGrblCommand`, `IsEmpty`)
- **webgrbl notes:** Status: not started. Parse in a Web Worker with streaming (`file.stream()` + `TextDecoderStream`) to handle 100 MB+ raster files without freezing the UI. Store lines compactly (typed arrays of parsed words + offsets into the original text) rather than one object per line. Keep the original text for display and save, and strip comments only when sending ([[lg-streaming]]). Parse multiple G words per line properly, following the GRBL modal-group rules.

### LG-GCODE-06 Program analysis: modal state and positions

- **What it does:** Walks the program once (`GrblFile.Analyze`) with a `StatePositionBuilder` that tracks the GRBL parser state and the tool position, to compute ranges, timing and laser state per line.
- **Where in the UI:** Not directly visible. It feeds the preview, bounding box, status-bar time and the expression variables in custom code.
- **Options & defaults:** Modal groups and defaults tracked: motion `G0`*/G1/G2/G3/G38.x/G80; coordinate system `G54`*–G59; plane `G17`*/G18/G19; distance `G90`*/G91; arc distance `G91.1`; feed mode `G94`*/G93; units `G21`*/G20; `G40`; `G49`*/G43.1; program `M0`*/M1/M2/M30; coolant `M9`*/M7/M8; spindle `M5`*/M3/M4 (* = default).
- **Behaviour & gotchas:**
  - Position: X/Y/Z start at 0. On a movement line the axis updates absolutely (`wco + value`) in G90 or incrementally in G91; missing axes keep their value.
  - `G92` (`IsSetWCO`) sets the offset `wco = current - value` and is not a movement.
  - A line counts as a **movement** if it has X/Y/Z (linear) or I/J/R (arc). The motion mode comes from the modal state, so a bare `X10` after `G1` is a G1.
  - **Laser burning** = `(PWM off OR S > 0) AND (M3 OR (M4 AND motion ≠ G0))`. S and F are "last value" registers (default 0).
  - **G20 is tracked but never applied**: inch programs are analysed and drawn as mm. G93 inverse-time is not handled. Plane selection is ignored (arcs are always XY).
  - Arcs (`G2G3Helper`): center = start + (I,J). Angles are computed per quadrant and the sweep follows CW/CCW. Start = end means a full circle. **R-format arcs are approximated** with the center at the chord midpoint (always a semicircle), which is wrong for any R other than half the chord.
  - Not modelled: G53, G28/G30, G10, tool-length offsets, Z in ranges.
- **Upstream source:** [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`StatePositionBuilder`, `StateBuilder`, `G2G3Helper`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`IsMovement`, `IsLinearMovement`, `IsArcMovement`, `IsSetWCO`, `IsPause`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`Analyze`)
- **webgrbl notes:** Status: not started. Build one shared, unit-tested G-code interpreter module (pure TypeScript, worker-safe) used by preview, estimation, bounding-box checks and "run from line" ([[lg-streaming]]). Implement G20 scaling, correct R arcs (center from radius and sign), multiple G words per line, and G53/G28 awareness. Output a compact segment buffer (`Float32Array` x0,y0,x1,y1,s,type,lineIndex) that WebGL can upload directly ([[lg-preview]]).

### LG-GCODE-07 Bounding box / ranges and quadrant

- **What it does:** Computes three ranges during analysis: **DrawingRange** (XY while burning), **MovingRange** (all XY positions, always including the origin 0,0), **SpindleRange** (min/max S over the file). From DrawingRange it derives the job's Cartesian quadrant (I, II, III, IV, Mix, Unknown).
- **Where in the UI:** Bounding box lines and labels in the preview, auto-zoom target ([[lg-preview]]). Variables `[left] [right] [top] [bottom] [width] [height]` in custom header/footer/button code. Job-size warnings ([[lg-machine-control]]).
- **Options & defaults:** None.
- **Behaviour & gotchas:**
  - For a linear move only the **end point** is added. The start point of a burning segment is only included if it was itself the end of a burning move, so the first point of each cut after a rapid is missing from DrawingRange (small underestimate).
  - Arc moves add their exact arc bounding box (quadrant-extremum algorithm; a full circle adds the whole circle).
  - SpindleRange is valid only if min ≠ max and max > 0. It drives the power shading in the preview.
  - Quadrant: I if Xmin ≥ 0 and Ymin ≥ 0; II if Xmax ≤ 0 and Ymin ≥ 0; III if Xmax ≤ 0 and Ymax ≤ 0; IV if Xmin ≥ 0 and Ymax ≤ 0; otherwise Mix; Unknown if no drawing.
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`ProgramRange`, `XYRange`, `SRange`, `Quadrant`, `Analyze`), [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`G2G3Helper.BBBox`)
- **webgrbl notes:** Status: not started. Include both endpoints of every burning segment. Compare the bounding box against the machine work area (`$130/$131`, with homing/WCO in mind) and warn before Send.

### LG-GCODE-08 Time estimation and projected time

- **What it does:** Estimates the total job duration at load time and, during a run, projects the remaining total from real progress.
- **Where in the UI:** Status bar "Lines: N" and "Estimated Time: …" after load. While running, the label changes to "Projected Time".
- **Options & defaults:** Uses `$110` (X max rate) from the live/cached GRBL configuration ([[lg-grbl-configuration]]).
- **Behaviour & gotchas:**
  - Per line: G0 move → `length / $110` minutes. G1/G2/G3 move with F ≠ 0 → `length / min(F, $110)`. `G4` → `P` seconds (or `S` if P is missing). Anything else (including G1 with F = 0) → 0.
  - Length is the XY Euclidean distance for lines (Z ignored) and |sweep × radius| for arcs.
  - No acceleration, junction deviation, Y rate (`$111`), feed/rapid overrides or M4 dynamics. Short-segment raster jobs are badly under-estimated.
  - Each command stores its cumulative estimated time (`TimeOffset`). The streaming code reports executed offsets so progress is time-weighted.
  - Projected total = `realElapsed × estimatedTotal / estimatedDone + totalPauses`. Before any progress it shows the estimate.
- **Upstream source:** [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`ComputeExecutionTime`, `GetSegmentLenght`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`Analyze`, `EstimatedTime`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`TimeProjection.ProjectedTarget`, `JobStart`, `JobExecuted`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`OnFileLoaded`, `TimerUpdate`)
- **webgrbl notes:** Status: in progress. Shipped in [[layers-and-gcode]]: the acceleration-aware job estimate, planned from `$110`, `$111`, `$120`, `$121` and the `$11` junction deviation (GRBL defaults when the laser reports none), across all passes, from the webgrbl toolpath (shown on the Job card and in the Toolpath toolbar). Not shipped: estimating an opened or streamed G-code file, projected time while running, a wall-clock ETA, and calibration from real runs. Original proposal: Implement an acceleration-aware estimator: a simplified GRBL planner simulation (trapezoidal profiles with `$120/$121` acceleration, `$11` junction deviation and per-axis `$110/$111` limits), run in a Web Worker after parsing. Multiply by the loop/pass count, and show ETA as wall-clock time. Calibrate from real runs (store actual vs estimated per machine).

### LG-GCODE-09 Save G-code (quick and advanced)

- **What it does:** Writes the loaded program to a `.nc` file. "Quick Save" writes it as-is. "Save (Advanced Options)" opens a dialog to add the custom header/footer/between-pass code and repeat the program N times.
- **Where in the UI:** File > Quick Save (hotkey **Ctrl+S**), File > Save (Advanced Options) (dialog "Save G-code options"). Both are enabled only when a program is loaded.
- **Options & defaults (Advanced dialog):**
  - **Export Header**: checked. Writes setting `GCode.CustomHeader` (default `G90 (use absolute coordinates)`).
  - **Export Footer**: checked. Writes `GCode.CustomFooter` (default `G0 X0 Y0 Z0 (move back to origin)`).
  - **Passes**: `1`, range `1`..`100`. The program body repeats N times.
  - **Export G-code between passes**: checked. Writes `GCode.CustomPasses` between repeats (not after the last). The default is a commented-out Z-sink example: `;(Uncomment if you want to sink Z axis)` / `;G91 (use relative coordinates)` / `;G0 Z-1 (sinks the Z axis, 1mm)` / `;G90 (use absolute coordinates)`.
  - **Use LF line endings**: unchecked (CRLF default).
  - The help text explains these options exist for running the file on stand-alone controllers.
- **Behaviour & gotchas:**
  - Quick Save = no header, no footer, 1 pass, CRLF.
  - Save dialog: filter `GCODE Files|*.nc` only; default name `<last opened file name>.nc` in the same folder.
  - Header/footer/passes text is split into lines. Blank lines are skipped, each line goes through `EvaluateExpression`, which replaces `[expr]` brackets with computed numbers. Variables: `left right top bottom width height` (DrawingRange), `jogstep jogspeed`, `WCO.X/Y/Z`, `MPos.X/Y/Z`, `WPos.X/Y/Z` (upstream bug: WPos returns MPos), every numeric `$n` setting (`$30` defaults to 1000 if unknown). Header/footer comments are kept as typed.
  - Body lines are written from the normalised command text (upper-case, comments stripped).
  - Write errors are swallowed silently (`catch {}`).
  - The same header/footer/passes snippets are sent at job start/end/between passes when streaming ([[lg-streaming]]). They are edited in Settings ([[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/SaveOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SaveOptionForm.cs), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`SaveGCODE`, `EvaluateAddLines`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`SaveProgram`, `GCODE_STD_HEADER`, `GCODE_STD_FOOTER`, `GCODE_STD_PASSES`, `EvaluateExpression`, `EvaluateCB`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnSaveProgramClick`, `MnAdvancedSave_Click`)
- **webgrbl notes:** Status: not started. Use `showSaveFilePicker` with a suggested name and `.nc/.gcode` types. Write through `FileSystemWritableFileStream` in chunks (a stream generator), not one big string. Fallback: a `Blob` + `<a download>`. Offer "save back" to the original handle. Report errors. Allow `.gcode` and other extensions. Use a sandboxed expression evaluator (no `eval`) for `[expr]`.

### LG-GCODE-10 Project files (.lps)

- **What it does:** Saves and restores "projects": the raster-import settings plus the original image, so a raster job can be regenerated later. Several raster imports (via Append) become several entries.
- **Where in the UI:** File > Save Project (enabled when a program is loaded). Restore through Open/drag-drop of a `.lps` file (filter `LaserGRBL Project|*.lps`).
- **Options & defaults:** Format: .NET `BinaryFormatter` serialisation of `List<Dictionary<string, object>>`. Each dictionary holds every raster-converter setting (`GetActualSettings` keys, e.g. `GrayScaleConversion.*`) plus `ImageName` (file name) and `ImageBase64` (the original file re-encoded in its own format).
- **Behaviour & gotchas:**
  - An entry is added each time the raster import dialog generates G-code (`RasterToLaserForm` → `Project.AddSettings`). G-code and SVG loads add nothing, so saving a project after loading G-code/SVG writes an **empty** project.
  - The list is cleared only by the File > Open and File > Reload menu items. Hotkeys, drag-drop and command-line opens don't clear it, so stale entries can end up in a later project.
  - Restore: for each entry, write the image to `%TEMP%\<ImageName>`, copy all its settings into the global Settings (overwriting the user's raster defaults), set it as the last file, then open the first entry via Reload (replace) and the rest via Open(append). The raster dialog appears for each, pre-filled. The temp image is deleted afterwards.
  - The default save name is `<last opened file name>.lps` in the same folder.
  - `BinaryFormatter` is insecure (arbitrary type deserialisation) and .NET-only.
- **Upstream source:** [`LaserGRBL/Tools/Project.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/Project.cs) (`AddSettings`, `ClearSettings`, `StoreSettings`, `LoadProject`, `SaveImage`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`SaveProject`, `OpenFile` project branch), [`LaserGRBL/RasterConverter/RasterToLaserForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/RasterConverter/RasterToLaserForm.cs) (`GetActualSettings`)
- **webgrbl notes:** Status: in progress. webgrbl has its own versioned project format, `.webgrbl.json` ([[projects-and-svg-import]]): Save as file and Open file, autosave in IndexedDB. Not yet: per-object converter settings, `file_handlers`, importing `.lps`. Original proposal: Define a versioned, documented project format, e.g. a zip (or a single JSON) holding `project.json` (objects, transforms, per-object converter settings, machine profile reference) plus the source assets (images, SVG, G-code). Store project settings per object instead of overwriting global defaults, and cover all object types, not just raster. Register the extension in manifest `file_handlers`. Importing `.lps` would need an MS-NRBF reader (the format is documented). That is optional and low priority.

### LG-GCODE-11 File loading events and program state

- **What it does:** Raises `OnFileLoading`/`OnFileLoaded(elapsed, filename)` around every load. These reset the time projection, rebuild the preview, update the status-bar line count and estimate, and toggle menu availability (Save, Save Project, Send need `HasProgram` = at least one command).
- **Where in the UI:** Status bar, File menu enablement, preview loading overlay.
- **Options & defaults:** None.
- **Behaviour & gotchas:** The `InUse` flag on `GrblFile` is set while the 3D preview builds its geometry, and loading is refused meanwhile ("already loading").
- **Upstream source:** [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`OnFileLoading`, `OnFileLoaded`, `InUse`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RiseOnFileLoaded`, `HasProgram`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`OnFileLoaded`)
- **webgrbl notes:** Status: not started. Expose the job as a reactive store (parse → analyse → geometry stages with progress). Allow cancelling a load instead of refusing new ones.

### LG-GCODE-12 Hershey single-stroke font (internal)

- **What it does:** Provides a built-in single-stroke vector font: ASCII 32–126, horizontal and vertical glyph tables stored as G-code snippets. `CreateString(text, cX, cY, speed, power, horiz, laserOnCmd)` writes centred text about 2 mm high with 0.3 mm letter spacing: `M5 S<power> F<speed>` first, the glyph moves with `M3` replaced by the given laser-on command, and `M5` after each glyph.
- **Where in the UI:** No user feature. Used only for the axis labels and titles of Generate > Power vs Speed test and Cutting Test ([[lg-generators]]).
- **Options & defaults:** Fixed size (no scale parameter); characters outside 32–126 are skipped.
- **Behaviour & gotchas:** There is no "add text to job" feature in LaserGRBL; SVG `<text>` is also unsupported ([[lg-svg-import]]).
- **Upstream source:** [`LaserGRBL/Hershey/Hershey.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Hershey/Hershey.cs) (`CreateString`, `MeasureString`, `ApplyOffset`)
- **webgrbl notes:** Status: not started. Ship a Hershey/single-line font as path data (not G-code strings) with scale, rotation and alignment. Offer a real "Add text" object (single-line fonts for engraving, outline fonts via opentype.js for cutting).

## Upstream Source

- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) - program list, load/append/save, analysis, ranges, quadrant, GDI preview drawing
- [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) - line parser and word accessors
- [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) - modal state machine, position tracking, time per command, arc helper
- [`LaserGRBL/SaveOptionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SaveOptionForm.cs) - advanced save dialog
- [`LaserGRBL/Tools/Project.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/Project.cs) - `.lps` project store/load
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - `OpenFile`, `ReOpenFile`, `SaveProgram`, `SaveProject`, header/footer defaults, expression evaluation, `TimeProjection`
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - File menu handlers, drag-and-drop, command-line args, status bar
- [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs) - default hotkeys (Ctrl+O, Ctrl+R, Ctrl+S, F5)
- [`LaserGRBL/Hershey/Hershey.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Hershey/Hershey.cs) - single-stroke font for generator labels
