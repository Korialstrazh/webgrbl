---
title: Job Preview (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Job Preview

The large drawing area in LaserGRBL's main window. It renders the loaded program as a 2D top-down toolpath (burning moves shaded by power, travel moves faint), with grid, rulers, bounding box, the live laser position, the mouse coordinates, executed-line progress colouring, zoom/pan and double-click-to-jog. There are two implementations: the default OpenGL panel (`GrblPanel3D`, actually an orthographic 2D view) and the "Legacy" GDI+ panel (`GrblPanel`). Both are hosted by `PreviewForm`, which also holds the machine buttons and custom-button bar ([[lg-machine-control]]).

## Key Takeaways

- **It is 2D.** Despite the name "3D", `GrblPanel3D` uses an orthographic camera looking at XY. Z is not drawn.
- **Two renderers.** Settings "Graphic mode": Auto / Hardware Acceleration (OpenGL FBO) / Software Rendering (OpenGL DIB) / Legacy (GDI). Only the OpenGL panel has zoom/pan, grid, line-width, executed-command colouring and the Preview menu options. The GDI panel is a static auto-fitted bitmap.
- **Power shading:** burning segments are coloured by `(S - Smin) / (Smax - Smin)` over the file's S range, blended toward the background colour (not alpha). Non-burning moves use a separate "other movement" colour and can be hidden.
- **Progress = per-line status colouring** (sent/OK/error) driven by the streaming acknowledgements, not by machine position.
- **Laser position cursor** = a cross at the *work* position (WPos) from GRBL status reports.
- **Double-click jogs** to the clicked point (left = jog speed, right = fast). Setting "Click 'n Jog", default on.
- **Time estimate is shown in the status bar,** not in the preview. Algorithm: [[lg-gcode-files]] LG-GCODE-08 (not acceleration-aware).
- **Colour scheme** comes from 7 built-in schemes with 14 preview colour roles. Default scheme: CAD Dark.

## Features

### LG-PREV-01 Renderer selection and fallback

- **What it does:** Chooses the preview implementation at startup and recovers from broken OpenGL drivers.
- **Where in the UI:** Settings > Graphic mode combo (`Auto`, `Hardware Acceleration`, `Software Rendering`, `Legacy`), command-line args `nogl` (force Legacy/GDI) and `swgl` (force Software).
- **Options & defaults:** Setting `ConfiguredGraphicMode` default `AUTO` (0). Auto = try an OpenGL 2.1 FBO context and fall back to a DIB-section context on failure.
- **Behaviour & gotchas:**
  - The OpenGL scene is rendered on a dedicated lowest-priority STA thread into an offscreen buffer, blitted to a bitmap and painted by WinForms.
  - Progress counter `OpCounter` (0 thread starting … 5 first frame done). If no frame completes within 5 s, or an exception occurs, the user is offered a switch FBO→Software or Software→Legacy with an app restart. Errors are drawn as a red overlay in the panel.
  - The vendor/renderer/GL version is logged and reported for diagnostics ([[lg-app-features]]).
- **Upstream source:** [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) (`CreatePanel`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`InitializeOpenGL`, `TimDetectIssue_Tick`, `GlDiagnosticMessage`), [`LaserGRBL/Settings.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Settings.cs) (`GraphicMode`), [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs)
- **webgrbl notes:** Status: not started. Use WebGL2 as the primary renderer, with a Canvas 2D fallback when `getContext('webgl2')` fails or `webglcontextlost` fires (restore on `webglcontextrestored`). Render in a Worker with `OffscreenCanvas.transferControlToOffscreen()` so streaming and UI never stutter. Consider WebGPU later. Prefer one renderer with full features over two diverging ones.

### LG-PREV-02 Toolpath rendering (burning vs travel, power shading)

- **What it does:** Draws every movement of the loaded program as line segments.
- **Where in the UI:** Main preview area. Rebuilt on every file load/append.
- **Options & defaults:**
  - OpenGL: two layers. **LaserOn** holds burning G0/G1 segments in `PreviewLaserPower`, intensity-shaded, plus all arcs. **LaserOff** holds non-burning segments in `PreviewOtherMovement`, line width fixed at 1 px.
  - Line width of LaserOn: Preview > Line size 1–5 px, setting `PreviewLineSize`, default `1`.
- **Behaviour & gotchas:**
  - A segment is drawn only if XY changed or it is an arc (`TrueMovement`). Z-only moves are invisible.
  - "Burning" = `(PWM off OR S > 0) AND (M3 OR (M4 AND not G0))` (see [[lg-gcode-files]] LG-GCODE-06).
  - Intensity: non-burning → 150/255. Burning with PWM on, a valid S range and an S already set → `(S - Smin) × 255 / (Smax - Smin)`. Otherwise 255. In OpenGL the colour is `lerp(background, colour, intensity)` (opaque), so low power fades into the background. The lowest S in the file is drawn at intensity 0, i.e. invisible (usually S0, but a file whose minimum burning S is > 0 hides its weakest moves).
  - Arcs (G2/G3) are tessellated into a fixed ~113 segments (`step = |sweep| / (36π)`) whatever their radius. R-format arcs use the approximate centre (see [[lg-gcode-files]]).
  - Geometry is built on the render thread into display lists of at most 5000 vertices each, with a "Loading x%" overlay. Each command keeps a link to its display list so it can be recoloured later (LG-PREV-07).
  - GDI panel: draws with `System.Drawing`. Non-burning moves are dashed (1,1) with alpha 150. The **first movement** of the program is drawn in `PreviewFirstMovement` (blue), a hint of where the job starts. Burning lines use alpha from the same intensity formula. The bitmap is rebuilt in a background thread on load, resize and colour change.
- **Upstream source:** [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) (`Grbl3D.Draw`, `Blend`, `Object3D`, `Object3DDisplayList`, `MAX_VECTOR_IN_DISPLAY_LIST`), [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`GetCurrentAlpha`, `LaserBurning`, `TrueMovement`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`DrawOnGraphics`, `DrawJobPreview`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DrawScene`)
- **webgrbl notes:** Status: done. Shipped in [[layers-and-gcode]]: the Toolpath view draws burning moves (power shaded in ten bands, or by layer colour) and optional travel moves from the real toolpath, as SVG paths in chunks. Not a WebGL renderer, and no first-move colour or Line size setting. Original proposal: Parse in a Worker into one interleaved `Float32Array` (x, y, power, flags, lineIndex), upload it once as a VBO and draw with `gl.LINES` (or instanced quads for widths > 1 px, since WebGL `lineWidth` is capped at 1 on most platforms). Compute shading in the shader from a uniform S range so colour/scheme changes don't need a rebuild. Add adaptive arc tessellation by chord error. Map the lowest burning S to a visible minimum intensity. Raster jobs with millions of segments need this GPU path. Optional extras: draw the beam/kerf width, show raster images as textures, and add a true 3D/Z view later. Update: a true 3D view shipped as the 3D burn preview (orthographic Three.js sheet with depth, cuts and liftable parts, see [[burn-preview]]); it is a depth estimate, not a toolpath renderer.

### LG-PREV-03 Grid, origin axes and rulers

- **What it does:** Draws a millimetre grid, the X/Y origin axes and labelled rulers along the left and bottom edges.
- **Where in the UI:** Always on (OpenGL panel). The GDI panel draws axes plus tick rulers on the axes.
- **Options & defaults:**
  - Grid unit `GridSize = worldWidth × 10 / controlWidthPx` (world mm per 10 px). Minor 1 mm lines (`PreviewGridMinor`) only when `GridSize ≤ 2`. Major lines (`PreviewGrid`) every `max(10, 2 × GridSize)` mm from the origin. Origin axes in `PreviewRuler`.
  - Ruler gutters: left 70 px, bottom 30 px (top/right 0). Label step from `GetRulerStep(worldWidth)`: 5, 10, 30 or 50 × 10^(digits − 3), by the leading digit of the view width.
  - Units: labels switch to `cm` when the view width is > 1000 mm and to `m` above 10000 mm. The unit is drawn in the corner.
  - Ruler labels at the bounding-box edges are drawn in `PreviewJobRange`, and labels within half a step of them are suppressed (when the bounding box is shown).
- **Behaviour & gotchas:**
  - GDI rulers: tick marks along the axes using `RulerStepCalculator`, labels formatted `0` or `0.0` (when the job is < 50 × 50 mm), placed on the side of the job's quadrant.
  - The text font is Courier New 12 (OpenGL bitmap text).
- **Upstream source:** [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) (`Grid3D`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DrawRulers`, `GetRulerStep`, `HumanReadableLength`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`DrawJobRange`)
- **webgrbl notes:** Status: not started. Draw the grid in a fragment shader (infinite, anti-aliased, no geometry), and the rulers as HTML/CSS or Canvas 2D overlays (crisp text, i18n, selectable units mm/inch). Show the machine work area (`$130/$131`) as a rectangle when known ([[lg-grbl-configuration]]).

### LG-PREV-04 Bounding box and job dimensions

- **What it does:** Marks the burning extent of the job (DrawingRange) with dashed lines across the whole view at Xmin, Xmax, Ymin, Ymax, and labels those coordinates.
- **Where in the UI:** Preview > Show bounding box (setting `ShowBoundingBox`, default **on**). GDI: always on.
- **Options & defaults:** Colour `PreviewJobRange`. OpenGL: 1 px line, stipple factor 10, pattern `0xAAAA`. GDI: dash pattern 1/zoom, 2/zoom, with labels on the axes.
- **Behaviour & gotchas:** The lines are full-width guides, not a rectangle. Width × height is not printed as a number anywhere; the user reads the edge labels. DrawingRange slightly underestimates (see [[lg-gcode-files]] LG-GCODE-07).
- **Upstream source:** [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) (`Grbl3D.Draw` bounding display list, `Invalidate`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`DrawJobRange`)
- **webgrbl notes:** Status: not started. Show an explicit rectangle plus a "W × H mm, origin X,Y" readout. Add a "frame/outline" action that traces the box with the laser off or at low power ([[lg-machine-control]]). Warn if the box falls outside the work area.

### LG-PREV-05 Zoom, pan and auto-size

- **What it does:** Navigates the OpenGL view.
- **Where in the UI:**
  - Mouse wheel zooms around the cursor: each event scales the view edges toward the mouse by `delta/1000`, i.e. 12 % per standard notch; negative delta zooms out.
  - Left-drag pans (cursor becomes SizeAll).
  - Preview > Zoom Auto (100%) **Ctrl+A**, Zoom In (+10%) **Ctrl+Plus**, Zoom Out (-10%) **Ctrl+Minus** (centre zoom ×1/1.1 / ×1.1).
  - Preview > Auto size mode: **Drawing area** (default) or **Moving area**.
- **Options & defaults:** Setting `AutoSizeOnDrawing` default **true**.
- **Behaviour & gotchas:**
  - Auto-size runs on every file load. It fits DrawingRange (or MovingRange, which always contains the origin) grown by 1.1, accounts for the ruler gutters, and keeps the aspect ratio. With no drawing it shows ±100 mm around the origin.
  - The view is clamped to ±1,000,000 mm, with a maximum span of 2,000,000 mm.
  - Resizing the control keeps the centre and the scale.
  - GDI panel: no zoom/pan. It always auto-fits the MovingRange at 95 %, anchored to a corner by quadrant (quadrant I → origin bottom-left with a 10 px margin; II → bottom-right; III → top-right; IV → top-left; Mix → centred).
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`GrblSceneControl_MouseWheel`, `GrblSceneControl_MouseMove`, `AutoSizeDrawing`, `ZoomIn`, `ZoomOut`, `CenterZoom`, `SetWorldPosition`, `GrblPanel3D_Resize`), [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) (`ScaleAndPosition`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (Preview menu handlers), [`LaserGRBL/HotKeysManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/HotKeysManager.cs)
- **webgrbl notes:** Status: not started. Use Pointer Events for mouse, pen and touch: pinch-zoom and two-finger pan for tablets, `wheel` with `ctrlKey` for trackpad pinch, `passive: false` to stop page zoom. Avoid Ctrl+A/Ctrl+Plus defaults, which clash with browser shortcuts; use `F`/`0`/`+`/`-` when the canvas has focus. Add "fit work area" as a third auto-size mode.

### LG-PREV-06 Laser position cursor and coordinate overlay

- **What it does:** Shows where the laser is and the live machine data.
- **Where in the UI:** Cross in the drawing. Overlay box at the top-right.
- **Options & defaults:**
  - Cross at **WPos** (work position): OpenGL arms are 1.5 × GridSize long, 3 px wide (`PointerSize`); GDI is a 10 px cross. Colour `PreviewCross`.
  - Overlay (OpenGL, Courier New 10, rounded box in `PreviewRuler` at alpha 100): header `X Y [Z]`; `MCO` machine position; `WCO` row (holding WPos) only when a work offset is non-zero; `PTR` mouse world position while hovering. Then `F` (current feed) and `S` (current power) once any non-zero value has been seen. Z columns appear when Z ≠ 0 or Settings "Enable Z jog control" is on.
  - GDI overlay: `X: Y:` (MPos), a second line (WPos) when offset ≠ 0, `F: S:`. The corner is chosen by the job quadrant.
- **Behaviour & gotchas:**
  - Updated from the main UI timer when WPos/MPos/F/S change (`TimerUpdate`), and in any case once per second.
  - Values come from GRBL `?` status reports ([[lg-connection]], [[lg-streaming]]).
  - The "WCO" label actually shows WPos (naming quirk).
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DrawPointer`, `DoGDIDraw`, `TimerUpdate`), [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs) (`OnPaint`, `TimerUpdate`)
- **webgrbl notes:** Status: not started. Render the cursor as a uniform-positioned sprite (no geometry rebuild) and interpolate between status reports for smooth motion. Put the DRO in accessible HTML outside the canvas. Optionally draw a trail of the actual head path from status reports to compare with the plan.

### LG-PREV-07 Job progress drawing (executed commands)

- **What it does:** While streaming, recolours each burning segment by the state of its G-code line, so the user sees what has been sent and confirmed.
- **Where in the UI:** Preview > Show executed commands (setting `ShowExecutedCommands`, default **on**). OpenGL only.
- **Options & defaults:** `ResponseGood` → `PreviewCommandOK`; `ResponseBad`/`InvalidResponse` → `PreviewCommandKO`; `WaitingResponse` (sent, not yet acknowledged) → `PreviewCommandWait`; otherwise the normal colour. Each is still intensity-blended.
- **Behaviour & gotchas:**
  - It tracks GRBL `ok` acknowledgements (planner acceptance), not physical execution, so the coloured front runs ahead of the laser by the planner buffer depth.
  - Changing a command's status invalidates its 5000-vertex display list, which is recompiled on the next frame.
  - At program end all statuses are cleared and the drawing returns to normal colours.
  - Travel (LaserOff) segments are not recoloured.
- **Upstream source:** [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) (`Grbl3D.Invalidate`, `InvalidateAll`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`ClearResult`, `SetResult`, `LinkedDisplayList`), [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`OnProgramEnded`)
- **webgrbl notes:** Status: in progress. The simulation part shipped in [[layers-and-gcode]]: the Toolpath view splits each path into burnt (solid) and remaining (dimmed, dashed) at the playback time, with play, pause, a scrub slider and 1x to 200x speed. Colouring by the streamed or acknowledged G-code line follows with running jobs (roadmap item 5). Original proposal: Keep a per-line status `Uint8Array` as a texture or attribute and let the shader colour by `lineIndex`. One `texSubImage` per status batch, no geometry rebuild. Add a "done up to here" marker based on the estimated executed line (ack count minus planner depth) and a scrub/simulation slider to replay the job before running.

### LG-PREV-08 Show/hide laser-off movements

- **What it does:** Toggles drawing of travel (non-burning) moves.
- **Where in the UI:** Preview > Show Laser Off movements (setting `ShowLaserOffMovements`, default **on**). OpenGL only. GDI always draws them dashed.
- **Options & defaults:** Colour `PreviewOtherMovement`, 1 px.
- **Behaviour & gotchas:** The loading percentage averages both layers when travel is shown.
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DrawScene`, `ShowLaserOffMovements_OnChange`), [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) (`Grbl3D` with `justLaserOffMovements`)
- **webgrbl notes:** Status: done. Shipped in [[layers-and-gcode]]: the "Show travel moves" switch in the Toolpath toolbar (off by default); travel is drawn as a thin muted line, not dashed, without arrows. Original proposal: A shader uniform toggle. Optionally draw travel dashed (as GDI does) and add arrows for direction.

### LG-PREV-09 Cross cursor and mouse coordinates

- **What it does:** Replaces the mouse pointer over the drawing area with full-width/height crosshair lines and an 8 px box, and shows the pointer's world coordinates (`PTR` row).
- **Where in the UI:** Preview > Show cross cursor (setting `CrossCursor`, default **on**). OpenGL only.
- **Options & defaults:** Colour `PreviewCrossCursor` with a 1 px shadow in the background colour at alpha 128. Limited to the area inside the ruler gutters. The system cursor is hidden while it is shown.
- **Behaviour & gotchas:** World coordinates = linear mapping of the pixel to the camera rectangle (Y inverted).
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DoGDIDraw`, `DrawCross`, `ShowCursor`, `GrblSceneControl_MouseMove`)
- **webgrbl notes:** Status: not started. Use CSS `cursor: crosshair` or `none` + overlay. Snap the readout to the grid when a modifier is held, and add a measure tool (drag to measure distance).

### LG-PREV-10 Click-to-jog on the preview

- **What it does:** Double-clicking a point in the preview jogs the laser head there.
- **Where in the UI:** Double-click on the preview: **left** = jog at the current jog speed, **right** = fast jog (speed 100000, capped by GRBL max rates). Settings "Click 'n Jog" (`Click N Jog`, default **on**). Both renderers.
- **Options & defaults:** The target is in work coordinates. It is clipped to machine bounds when soft limits are enabled (`LimitToBound`).
- **Behaviour & gotchas:** Ignored when jogging isn't allowed (e.g. running, alarm). It uses `$J=` on GRBL 1.1, or a G0/G1 fallback on 0.9, and continuous-jog mode if enabled. Details in [[lg-machine-control]].
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`GrblPanel3D_DoubleClick`), [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs) (`GrblPanel_MouseDoubleClick`, `DrawToMachine`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`JogToPosition`)
- **webgrbl notes:** Status: not started. On touch, use long-press plus a confirmation, since a stray tap must not move the machine. Show a target marker and a cancel (jog-cancel `0x85`) while moving. Right-click conflicts with the browser context menu, so use a modifier key or a context menu entry instead.

### LG-PREV-11 Status overlays (loading, tips, diagnostics)

- **What it does:** Draws informational boxes in the preview.
- **Where in the UI:** Top-right stack under the coordinate box, and bottom-right tips.
- **Options & defaults:**
  - Loading: "Loading x.x %" while geometry builds, or "Clear drawing" / "Prepare drawing" messages.
  - Tips when no file is loaded: basic usage, zoom, pan, jog hints, plus the configured shortcuts for auto-size/zoom.
  - Diagnostics: Preview > Show diagnostic data (setting `ShowPerformanceDiagnostic`, default off). Shows vertex count (K/M/B), average frame time, average sleep time and repaints per second.
- **Behaviour & gotchas:** The render loop sleeps adaptively, 15–50 ms, mapped from frame times of 10–100 ms. It redraws when signalled, or at least every 10 s.
- **Upstream source:** [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) (`DoGDIDraw`, `BestSleep`, `DrawScene`)
- **webgrbl notes:** Status: not started. Render on demand with `requestAnimationFrame` only when something changed (view, status, cursor) to save battery. Add an empty-state drop zone ("Drop a G-code, SVG or image here") tied to drag-and-drop ([[lg-gcode-files]]).

### LG-PREV-12 Colour schemes for the preview

- **What it does:** Applies a named colour scheme to the preview (and the whole UI).
- **Where in the UI:** Colors menu: CAD Style, CAD Dark, Blue Laser, Red Laser, Dark, Hacker, Nighty. Setting `Color Schema`, default **CAD Dark**. Changing it rebuilds/recolours the preview immediately (`OnColorChange`).
- **Options & defaults:** Preview roles: `PreviewBackColor`, `PreviewText`, `PreviewRuler` (origin axes, overlay boxes), `PreviewGrid`, `PreviewGridMinor`, `PreviewJobRange` (bounding box, bbox labels, unit label), `PreviewFirstMovement` (GDI only), `PreviewOtherMovement` (travel), `PreviewLaserPower` (burn), `PreviewCross` (laser cursor), `PreviewCommandOK`, `PreviewCommandKO`, `PreviewCommandWait`, `PreviewCrossCursor`. Key values:

  | Scheme | Back | Burn | Travel | Cursor | Job range |
  |---|---|---|---|---|---|
  | CAD Style | 33,40,48 | 220,220,220 | 60,82,85 | 230,230,20 | 200,200,140 |
  | CAD Dark (default) | 23,30,38 | 220,220,220 | 60,82,85 | 230,230,20 | 200,200,140 |
  | Blue Laser | LightYellow | Red | LightGray | Blue | DarkGray |
  | Red Laser | LightYellow | DarkBlue | LightGray | DarkViolet | DarkGray |
  | Dark | 220,220,220 | Red | 180,118,0 | DarkMagenta | DimGray |
  | Hacker | 220,220,220 | DarkGreen | 180,118,0 | DarkMagenta | DimGray |
  | Nighty | 25,25,25 | 0,125,140 | 150,0,120 | Pink | LightPink |

- **Behaviour & gotchas:** "Dark" and "Hacker" are dark UI schemes with a *light* preview background. Full per-role values are in `ColorScheme.cs`.
- **Upstream source:** [`LaserGRBL/ColorScheme.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ColorScheme.cs) (`IColorScheme`, `Scheme*` classes, `ColorScheme`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs)
- **webgrbl notes:** Status: not started. Define preview colours as CSS custom properties / design tokens read into shader uniforms. Follow `prefers-color-scheme` by default, allow user themes, and check contrast. Theme switching must not rebuild geometry.

### LG-PREV-13 Estimated / projected time display

- **What it does:** Shows the job duration next to the preview in the status bar: "Estimated Time" after load, "Projected Time" during a run. Also shows the line count.
- **Where in the UI:** Main window status bar.
- **Options & defaults:** Formatted to whole seconds.
- **Behaviour & gotchas:** Not acceleration-aware: distance / min(F, `$110`), G0 at `$110`, plus G4 dwells. Projection scales the elapsed time by estimated progress. Full algorithm in [[lg-gcode-files]] LG-GCODE-08.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`OnFileLoaded`, `TimerUpdate`), [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) (`ComputeExecutionTime`)
- **webgrbl notes:** Status: in progress. The estimate shipped in [[layers-and-gcode]], acceleration-aware and better than LaserGRBL's: `getMotionTimeline` plans each move under `$110`, `$111`, `$120`, `$121` and the `$11` junction deviation (GRBL defaults when the laser reports none), counting all passes. It shows on the Job card and in the Toolpath toolbar next to the job size, only while the toolpath is current. The projected time during a run, the line count and the status bar readout (still `ComingSoon`) follow with running jobs. Original proposal: Show the estimate inside the preview header together with size, line count and passes (estimate × loop count). Use the acceleration-aware estimator proposed in [[lg-gcode-files]].

### LG-PREV-14 UsageClassPreview (not a job preview)

- **What it does:** Despite the name, a bar chart in the Laser Lifespan dialog. It shows hours of laser use per power class (0–10 %, …, 90–100 %) on a blue→red palette, with tooltips `"<range>% <hours> h"`.
- **Where in the UI:** the "Laser Lifespan" menu item ([[lg-app-features]]).
- **Options & defaults:** 10 classes, a fixed 10-colour gradient, scaled to 105 % of the largest class.
- **Behaviour & gotchas:** Unrelated to toolpath preview. Listed here only because the task scope named it.
- **Upstream source:** [`LaserGRBL/UserControls/UsageClassPreview.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/UsageClassPreview.cs)
- **webgrbl notes:** Status: not started. Implement with the laser-life feature, as an SVG/Canvas bar chart.

## Upstream Source

- [`LaserGRBL/PreviewForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/PreviewForm.cs) - host control: picks GDI vs OpenGL panel, machine buttons, custom buttons bar
- [`LaserGRBL/UserControls/GrblPanel3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel3D.cs) - OpenGL (SharpGL) preview: camera, render thread, rulers, overlays, zoom/pan, click-to-jog, fallback detection
- [`LaserGRBL/UserControls/GrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/GrblPanel.cs) - legacy GDI+ preview
- [`LaserGRBL/UserControls/IGrblPanel.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/IGrblPanel.cs) - common panel interface
- [`LaserGRBL/Obj3D/Objects3D.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Obj3D/Objects3D.cs) - `Grid3D`, `Grbl3D` (toolpath geometry, shading, bounding box, executed-command colouring), display-list chunking
- [`LaserGRBL/GrblFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblFile.cs) - GDI drawing (`DrawOnGraphics`, `DrawJobPreview`, `DrawJobRange`, `ScaleAndPosition`), ranges
- [`LaserGRBL/StateBuilder.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/StateBuilder.cs) - burning state, power alpha, arc helper
- [`LaserGRBL/ColorScheme.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ColorScheme.cs) - colour schemes
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - Preview menu (zoom, toggles, line size, auto-size mode), Colors menu, status bar time
- [`LaserGRBL/UserControls/UsageClassPreview.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/UsageClassPreview.cs) - laser-life usage chart (unrelated to job preview)
- `LaserGRBL/SharpGL/` - vendored SharpGL OpenGL wrapper (third-party)
