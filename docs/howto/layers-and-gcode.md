# Layers, G-code and the simulation

Each colour in your drawing becomes a layer with laser settings. From the layers webgrbl builds a toolpath, shows it in the Toolpath view (with a play-back simulation and a time estimate), and exports it as G-code. This page shows what the user gets, how the rules work and where the limits are. Design details: `docs/wiki/architecture/layers-and-gcode.md`.

## What the user gets

- **Palette.** A list of laser colours (Cut, Score, Fill and Shading to start with), each with mode, power, speed, passes, air assist and line interval. Open it with the "Palette" button in the Layers section. The palette is kept in the browser (`localStorage`) and is the same for every project.
- **Layers.** When you import a drawing, each colour it uses becomes a layer in the Layers section, in burn order. Drag a layer (or use its Move up / Move down buttons) to change the order. The eye toggle (open eye when the layer is sent, crossed-out muted eye when it stays home, and the row dims; a real checkbox for keyboards and screen readers) sends the layer to the laser or leaves it off. Each row shows power, speed and passes as bare numbers next to a bolt, gauge and loop icon; the units are in each value's tooltip and in the spoken row summary. The button on a row opens the Layer settings drawer, which slides in from the left right next to the design panel, so the layer list stays visible.
- **Layer settings.** Send to laser, Mode (Line or Fill), Max power and Min power in percent (with watts when the machine profile has a laser power), Speed in mm/min, Passes, Line interval (Fill only) and Air assist (only when the machine profile has air assist). "Save to palette" stores the settings as the palette entry; "Edit palette..." opens the palette.
- **Design view by layer.** The Design view draws each object the way its layers burn it: paths on a Line layer as thin outlines in the layer colour with no fill, paths on a fill or shading layer filled as drawn, and paths on a layer that is off dimmed, so the Design view matches what the Toolpath view burns. In code: `getObjectDesignDrawing` (`src/utils/bed/`) reads an artwork once into the same flattened shapes the toolpath uses, in artwork millimetres, grouped in runs of one paint role and layer; `ObjectDesignArtwork` draws each run as one SVG group whose class and stroke attribute come from the layer (`getDesignLayerLooks`), so a layer change restyles groups and a drag only moves the box. An artwork whose paints all sit on enabled fill layers stays the cheaper SVG image (`isDesignDrawnAsAuthored`).
- **Toolpath view.** Switch the bed from Design to Toolpath to see the real job: burnt and remaining parts, optional travel moves, a head marker and a playback bar. Editing objects is not possible there. The "3D" option shows the burn preview: see [burn-preview](burn-preview.md).
- **Export G-code.** In the Project menu and on the Job card.

## The palette

Open it with "Palette". Select an entry to edit it, drag entries (or use Move up / Move down) to reorder, "+ New colour" to add one, and Delete (it asks first) to remove one; the edited entry is highlighted across its whole row, and the Delete cross is quiet, shown on hover, keyboard focus or for the edited entry. Nothing changes until you press Save, and Save refuses an entry with an error (empty name, a power outside 0..100 %, speed outside 1..20000 mm/min, passes outside 1..50, line interval outside 0.02..2 mm, min power above max power, or a colour another entry already uses). "Reset" replaces the whole palette after you confirm.

The Shading entry is built in: it cannot be deleted and its colour is fixed (see "Greys" below).

### Export the palette for Inkscape

"Export" (download icon, beside the Inkscape help) downloads `webgrbl.gpl`, a GIMP palette file (the format Inkscape reads) with one swatch per entry, named like the entry. Put it in the Inkscape user palette folder:

| System | Folder |
| --- | --- |
| Linux | `~/.config/inkscape/palettes/` |
| Windows | `%APPDATA%\inkscape\palettes\` |
| macOS | `~/Library/Application Support/org.inkscape.Inkscape/config/inkscape/palettes/` |

Restart Inkscape: it only reads the palette folder when it starts. The palette then appears in the palette list at the bottom of the Inkscape window (and in Fill and Stroke). Draw with these swatches and the colours will match your layers exactly. (The palette dialog shows the Linux and Windows folders as a hint; the macOS folder is listed here only.)

## How colours become layers

- **Where the colour comes from.** From the fill and the stroke of each drawn shape (`path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`). The colour can be set by an attribute, a `<style>` block or an inline `style`, and it is inherited from groups. Colour names, `#rgb`, `#rrggbb`, `rgb()`, `rgba()`, `hsl()` and `currentColor` work. A shape with fill or stroke `none`, fully transparent, hidden or with a stroke width of 0 gives no layer.
- **Exact match.** A colour that is exactly a palette colour gets that entry's settings and is switched on.
- **Greys.** Any grey (red, green and blue within 10 of each other) goes to one shared Shading layer, whatever its exact grey. Inside it, darker burns harder: power runs from Max power for black down to Min power for white, and white burns nothing. Gradients that only use greys go there too, and the power follows the gradient.
- **Unknown colours.** A colour that is not in the palette gets a layer that is switched **off**, with the settings of the nearest palette colour (never the Shading settings). It shows "Not in the palette". Switch it on, adjust it, and use "Save to palette" to keep it. A gradient with a colour stop counts as its first colour stop.
- **Layers stay.** A layer you set up stays in the project even if its colour disappears from the drawing, and comes back with its settings if the colour returns (or on undo). Importing again only adds layers for new colours; existing layers keep their settings.

## Line and fill modes

- **Line.** A shape whose stroke is in a Line layer burns along its outline, open or closed. A shape whose fill is in a Line layer burns its closed outline too, but only when that fill burns: a white fill (power 0 in the Shading layer) never closes an open stroke with an extra line. If both the fill and the stroke are in the layer, the outline burns once. Inner shapes burn before the outer ones around them, so a part does not move before it is scored. Power is the layer's Max power (or the grey power in the Shading layer).
- **Fill.** The shape is engraved with lines at the layer's line interval (0.1 mm means 10 lines per mm), going back and forth. A stroke in a Fill layer is engraved at its drawn width. A stroke in a Line layer is not filled.
- **Paint order.** What is on top wins. In fill layers a shape hides the shapes under it, even when it belongs to another layer, or to a layer that is switched off. Only the visible part burns, so a white shape on top of a black one cuts a hole in the engraving. White burns nothing but still hides what is below.
- **Passes.** Each pass repeats the whole layer before the next layer starts. Layers burn in the order of the Layers section.
- **Transforms.** The object's position, size and rotation on the bed, and the drawing's own transforms and nested viewBoxes, are applied. Curves are flattened to 0.05 mm.

## Origin and work zero

G-code positions are measured from the **origin corner** of the active machine profile (front left by default; the Toolpath view marks it with a circle). Set the machine's work zero at that corner before you run the file, or the job lands shifted. A bed coordinate is mirrored to the corner: with a right-hand origin X counts from the right edge, with a back origin Y counts from the back edge. The header of the file says which corner it was made for.

## The G-code

The file is plain GRBL 1.1 laser G-code, for example:

```gcode
; webgrbl 0.1.0 - My project - 2026-11-02T09:30:00.000Z
; profile: My laser, S max 1000, origin front-left
G21 G90
M4 S0
G0 X10 Y10
G1 X50 Y10 S1000 F300
G1 X50 Y40
M5 S0
```

- The two header comment lines are printable ASCII only. Line breaks in a project or profile name become spaces, `(` `)` `;` become `[` `]` `,`, accented letters lose their accent and other characters outside ASCII become `?`. A name read from an imported file can therefore never add a G-code line, and no byte can reach GRBL as a realtime override.
- Units are mm and positions are absolute (`G21 G90`).
- `M4` is dynamic laser mode: the laser power follows the speed and is off during travel. It needs **`$32=1`** (laser mode) on the controller. webgrbl does not check or change `$32` when you export, so set it before you run the file; with `$32=0` the laser would stay on during moves.
- Travel is `G0`, burning is `G1`. X and Y are written on every move; `S` (power) and `F` (feed) only when they change.
- `S` is the power percent of the profile's S max (the `$30` the connected laser reports, else the profile's value, else 1000).
- Fills add 2 mm of overscan at each end of a line. The head travels to the start of the run-in with `G0`, but the overscan itself is written as `G1` moves at `S0` and the layer's feed, never as `G0`. At the edges of the work area the overscan is shortened, so a fill that touches the bed edge never sends the head past 0 or past the work area width (no soft-limit alarm, no crash into the frame). The laser may then still be speeding up on the first millimetres at the very edge.
- The preview and the estimate start the head at the profile's origin corner (where work zero is), so the first travel and its time match the real machine.
- With air assist on the profile, `M8` / `M9` go around the moves of layers that use it.
- The file ends with `M5 S0`. The name is `<project name>.gcode`.

### Export

"Export G-code" is available when there is an active machine profile and at least one layer is switched on, and not while the toolpath is generating (the tooltip says what is missing). If the toolpath is not ready, it is made first. If parts of the design are left out of the job or burn differently than the bed shows, you see a list of the objects and the reasons: "Export anyway" downloads the file, Cancel downloads nothing. After a download a toast names the file. Opening another project while an export waits cancels it (with a toast).

## Toolpath view and simulation

Switch to Toolpath. If there is no toolpath yet, or it is out of date, a banner offers Generate or Regenerate (opening the view requests it by itself); while it is generated you see a progress bar and a Cancel button. Generation runs in the background so the page stays responsive.

- **Colours.** "Power shading" (brighter for more power) or "By layer" (the layer colour). "Show travel moves" draws the moves without the laser, as a 1.5 px dashed line in the travel colour of the bed tone.
- **Warnings.** A panel lists what the job leaves out.
- **Playback bar.** Back to start, Play / Pause, To end, a slider to scrub, the elapsed and total time, a speed of 1, 10, 50 or 200 times, and a readout of the head's X, Y and power. A strip above the slider shows how much of the time each layer takes. Press Space with the bar focused to play or pause. Burnt parts are drawn solid, remaining parts dim and dashed. Play at the end starts again from the beginning.
- **Out of date.** When you change the design, the toolpath is out of date: playback stops and goes back to the start, and the banner offers Regenerate. A toolpath that is not current never plays.
- **The live machine head and the work-zero marker are hidden** in this view; it draws its own head and origin instead.

## The time estimate

Shown on the Job card ("Estimate") and in the playback bar clock, next to the job size ("Job 50.0 × 30.0 mm"), only while the toolpath is current. The toolpath is worked out in the background after every change (150 ms after the last one) when a layer is switched on, so the status strip shows the job size and estimate in the Design view too, with "Calculating..." while it runs and a dash when nothing is switched on. The job size is what burns (burnt lines plus fill overscan); an object's size in the Objects list is its frame (the SVG page, empty margins included), shown after a width icon with the frame explained in its tooltip, so the two can differ. It is planned the way GRBL moves: every move speeds up and slows down at the machine's acceleration (`$120`, `$121`) and maximum rate (`$110`, `$111`), and corners are taken at the speed `$11` (junction deviation) allows. The values come from the connected laser; without a connection, or when a value is missing, the GRBL defaults are used (6000 mm/min, 1000 mm/s², 0.01 mm). All passes and the overscan of fills are included. It is an estimate, not a promise.

## Known limits

- **Text** that is not converted to paths is skipped, with a warning. In Inkscape use Path > Object to Path.
- **Images** are skipped, with a warning ("Images are not engraved yet.").
- **`<use>`** copies are followed (so colours inside them make layers), up to 20 000 copied elements per SVG; beyond that, the extra parts are left out with a warning. Uses inside `defs`, `symbol`, `clipPath` and `mask` content are not expanded.
- **Unreadable drawings.** An object whose SVG cannot be read again burns nothing and is listed with a warning ("drawings that could not be read"); import the SVG again.
- **Off-page and clipped content** still burns in full, with a warning. The bed hides the parts outside the page, but the toolpath does not; clip paths and masks are not applied.
- **A stale toolpath must be regenerated** before it can play or be estimated (export generates it for you).
- **The Toolpath view hides the live machine head.**
- A file whose `width` / `height` proportions differ from its `viewBox` is stretched to fit, the same way the bed shows it.
- Only the Line and Fill modes exist. Raster images, arcs (`G2` / `G3`), and a laser without `M4` come later.
- No in-app handbook exists yet, so this page and the wiki are the only documentation.

## Extending it

- New palette fields: `src/utils/palette/` (model, validation, `.gpl` writer), then `LayerSettings` and `getLayerSettings`.
- New burn behaviour: `src/utils/toolpath/` (`getToolpath` is the one model that the G-code writer, the estimate and the preview read).
- New G-code words: `getGcodeText` and `gcode.constants.ts`.
