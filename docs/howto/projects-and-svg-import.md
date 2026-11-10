# Projects and SVG import

A project is the design on the bed: SVG objects with a size, position and rotation. Projects are saved in the browser on their own, can be saved as a file and opened again, and survive a reload. This page shows what the user gets, how the numbers work and how to extend it. Design details: `docs/wiki/architecture/projects-and-svg-import.md`.

## What the user gets

- **Import.** The "Import SVG" button (top bar, and in the empty Objects section) and a drop of one or more files on the bed (`SvgImportButton`, `useSvgFileDrop` in `BedPanel`). Each file becomes an object named after the file, placed at the first free spot on the bed (`getFreeBedSpot`: searched on a 5 mm grid from 0,0, row by row, keeping a 5 mm gap from every object already there, rotated ones by their turned box), so new objects never land on top of others; placement uses the drawn geometry (`getObjectArtworkBedBounds`), not the page box, so lines outside the page never start off the bed; on a full bed it falls back to the old cascade, `((existingCount + i) mod 10) × 10` mm on X and Y. A drawing larger than the bed starts with its front-left corner at the bed origin, the bed view zooms out to show the whole selection (`BedSelectionFitRequested`, `newSelectionFitBedViewport`; the bed may shrink to a quarter of its fitted size), and its info toast offers **Fit to bed** (`fitToBedObjectId`), one undo step. The test sample uses the same search, starting at its margin from the origin corner; a dropped file that is not an SVG (a PNG, say) is named in an error toast. A project holds up to 50 objects, a file may be up to 10 MB.
- **Edit.** Select (click, Shift-click, click on empty bed to clear), drag, scale and rotate with the handles, nudge with the arrow keys (1 mm, Shift 10 mm), Delete or Backspace to remove, and X / Y / Width / Height / Rotation fields in the Objects section.
- **Undo and redo.** Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y, and the top bar buttons. 100 steps. One gesture is one step: a drag, a handle gesture, one field commit, and an import of several files. The undo and redo keys do nothing while a drag or handle gesture is still under way.
- **Open dialog** (`OpenProjectDialog`): stored projects newest first; each row shows a small thumbnail (`ProjectThumbnail`: every object's box where it sits, turned as it is, from `ProjectSummary.objectBoxes`, so no SVG text is loaded), its name (a project that still has the default name shows its first object's name and the day it was made, "sample · Nov 9, 2026", `getProjectDisplayName`; the stored name is unchanged). The top bar, the browser tab title and the Open row of the open project all read `selectProjectDisplayName`, so the three always agree, then its object count and how long ago it changed ("3 objects · 5 minutes ago", `getProjectChangedRelativeTimeText`), with the exact time in a tooltip, so projects with the same name can be told apart.
- **Project menu** (top bar): New project, Open..., Save (Ctrl/Cmd+S), Save as file, Open file.... Click the name to rename it. Each row of the Objects list starts with an icon for its kind: a picture for an imported SVG drawing, a flask for the test sample. The autosave readout shows an icon (a green tick for Saved, a spinning arrow for Saving..., a grey clock for Waiting to save, since autosave stores the change shortly; a failed save shows an error toast) and the word, in a fixed width so the buttons after it never shift; below 1000 px only the icon stays (hover it for the word, which is also read out), so Import SVG and the connection pill keep their room. Below 1000 px the app name goes too, the laser profile button keeps only its icon (hover it for the profile name), and the project name takes its place on one line, cut with an ellipsis when long; its tooltip shows the whole name. Deleting the last object moves the focus to Import SVG: the Job card's next-step button in the wide layout, the empty bed card in a narrow one (the empty Objects line when the bed is not on screen). A selected object shows its fields in two compact rows at the top of the Objects card, above the list; selecting an object scrolls its fields and its row into view, so the object being edited is always in sight: X over Y, W over H, then rotation over the ratio lock. The Shading row of the palette carries a small built-in badge (hover it for "Built-in") beside its lock, so it is clear without a hover why it cannot be deleted. Export G-code is still "soon".
- **Off the bed.** The part of an object outside the bed is drawn faint (`offBedArtwork` in `BedObjectGraphic`, 30 % opacity, no halo, no presses), under the rulers, so a huge or misplaced import shows where it lies; the part on the bed stays clipped at the edge and drawn in full. The rulers run across the whole viewport, past the bed and into negative values (`getBedRulerTickPositions` no longer clamps to the bed), so off-bed artwork keeps a scale. Any active off-bed content locks Start and Frame (see `docs/howto/running-jobs.md`). In an object's problem popover, Move onto bed is off for an object larger than the bed: its tooltip says so and Fit to bed becomes the accent action.
- **Project name.** While a project still has the default name, the first SVG import or test sample stores the derived name (first object and the day it was made) as the project's own name (`storeDerivedProjectName`, run after the import in the project command queue), so deleting every object later never turns the title back into "Untitled project".

## Coordinates

Objects live in the machine frame in millimetres, X to the right and Y up, with the origin at the front-left of the bed. `xMm` / `yMm` are the front-left corner of the box before rotation, and `rotationDeg` turns counter-clockwise around the box centre. `getObjectCorners` gives the rotated corners; `isObjectOutsideBed` uses them, so a rotated object that pokes out of the bed is flagged (a warning chip in the list, a dashed outline on the bed, and drawn muted without the halo). Placing an object outside the bed is allowed; nothing is clipped.

## Size of an imported SVG

The size is read from `width` and `height` (units mm, cm, in, pt, pc, px) or, without them, from the `viewBox` in user units.

- **96 px per inch**, as the SVG spec says: `1 px = 25.4 / 96 mm`. A unitless number is px.
- **Illustrator** files made at 72 per inch (or with the viewBox at 72 per inch and no units) come in 4/3 too small. Fix it by setting the Width in the Objects section to the real size (keep "Lock aspect ratio" on), or export from Illustrator with units in mm. There is no DPI override yet.
- A file with no size is rejected ("no size", `no-size`). Width and height are clamped to 0.1..5000 mm when edited.
- An object bigger than the bed is imported anyway, with an info toast.

## What the sanitiser changes

Every imported SVG is rewritten by `getSanitizedSvg` (`src/utils/svg/`) before it is stored or drawn. The stored `svgText` is always the sanitised one.

| Content | Result | Toast |
| --- | --- | --- |
| Not parseable, not in the SVG namespace, no `svg` root | File rejected | "not a usable SVG file" |
| No usable width, height or viewBox | File rejected | "no size" |
| Over 10 MB | File rejected, not even read | "larger than 10 MB" |
| `<script>`, `on*` attributes, `javascript:` links, animations that target `href` | Removed silently | none |
| Editor metadata (sodipodi, inkscape, rdf) | Removed silently | none |
| `foreignObject` and XHTML content | Removed | "parts were left out" |
| Linked images (`href` to a file or URL; data images of png, jpeg, gif and webp stay) | Removed | "parts were left out" |
| Remote or escaped CSS references (`url()`, `@import`, `image-set`) in `<style>`, `style`, presentation attributes and animation values | Removed | "parts were left out" |

The toast names the file and shows once per file, however many things were removed. A rejected file never stops the other files of the same import. Toast texts never contain parser errors.

## Where it is stored

| What | Where | Written |
| --- | --- | --- |
| Project name, times, object transforms, layers | IndexedDB database `webgrbl`, table `projects` | every autosave |
| SVG text of each object | table `svgAssets`, key `[projectId+objectId]` | once, the first save that holds the object |
| Id of the last opened project | table `appState` | when a project opens |
| Workbench panel sizes (percentages) | table `appState`, key `panelSizes` | when a panel resize ends |
| Machine profiles | `localStorage` (see `docs/howto/machine-control.md`) | not part of a project |

The split keeps an autosave after a nudge small: only the project row is rewritten. A save never deletes SVG rows, because undo can bring a removed object back. Unused rows are deleted when a project opens and, for the project that was closed, right after the next one is on screen (the history is empty or gone then).

**Autosave timing** (`project.constants.ts`, `project.autosave.saga.ts`): a change marks the project "Waiting to save"; the save runs 1000 ms after the last change, at the latest 3000 ms after the first unsaved change, and at once when the tab is hidden or the page is left (`visibilitychange`, `pagehide`). A failed save keeps the changes on screen, shows one toast until a save works again, and the next change tries again. If the project was deleted in another tab, the next save stores the document in a new project.

## Project file

"Save as file" downloads `<project name>.webgrbl.json` (characters file systems forbid are left out). It is pretty JSON and self-contained:

```json
{
  "format": "webgrbl-project",
  "version": 3,
  "name": "Coaster",
  "objects": [
    {
      "id": "…", "name": "logo", "svgText": "<svg …/>",
      "intrinsicWidthMm": 40, "intrinsicHeightMm": 40,
      "xMm": 10, "yMm": 10, "widthMm": 40, "heightMm": 40, "rotationDeg": 0
    }
  ],
  "layers": [
    {
      "colour": "#ff0000", "enabled": true, "order": 0,
      "settings": { "mode": "line", "maxPowerPercent": 100, "minPowerPercent": 0, "speedMmPerMin": 300,
        "passes": 3, "airAssist": false, "lineIntervalMm": 0.1 },
      "paletteEntryId": "palette-cut", "isShading": false
    }
  ]
}
```

"Open file..." (also in the Open dialog) always creates a **new** project with new ids, so a file never overwrites a stored project. A file over `MAX_PROJECT_FILE_BYTES` (50 objects of 10 MB plus 50 MB for the JSON around them) is rejected before it is read. Import (`getImportedProjectFile`) rejects the whole file when the format or version is wrong, there are more than 50 objects, a field has the wrong type, or any SVG fails sanitising; it sanitises every SVG again, re-measures the size, clamps the box, brings the rotation into [0, 360) and trims each object name and cuts it to 100 characters. An invalid file shows "The file is not a webgrbl project file. Nothing was opened." and changes nothing. A new file version needs `PROJECT_FILE_VERSION` raised and a reader for the old one.

Layers in a file: a version 2 or 3 file carries `layers`; each one is type-checked (`isProjectLayer`), its settings are clamped to the palette ranges, and a layer whose colour no object draws is kept. A version 1 file (written before layers) opens with its layers derived from the current palette. Any other version is rejected. Either way, a colour the objects draw that has no layer gets one from the palette.

## Layers in the document

`ProjectDocument` is `{ objects, layers }`. Layers are derived from the palette in the sagas, before the action is put, never in the reducer: the SVG import saga derives them before `ProjectObjectsAdded {objects, layers}`, and `openLoadedProject` (start, Open, New, switching, file import) before `ProjectDocumentLoaded`. So an import and its layers are one undo step, and undo and redo restore the layers exactly without deriving again. A project stored before layers existed (no `layers` in its row) gets its layers derived when it opens.

- `selectProjectLayers` gives only the layers some object draws with, sorted by `order`. A layer whose colour is gone stays in the document, hidden, so undo brings it back with its settings.
- `LayerSettingsChanged {layerKey, settings}` (settings clamped to the palette ranges, a non-finite value ignored), `LayerToggled {layerKey, enabled}` and `LayersReordered {layerKeys}` (the visible keys in the new order; hidden layers keep their relative order after them) are each one undo step; a change that changes nothing makes no step. All three trigger the autosave.
- Paints of an object are read once per SVG text (`getObjectPaints`, a cache of the 200 most recently used texts).

## Element tree of an object

The tree button (`ApartmentOutlined`) on an Objects row opens `ObjectElementTree`: the object's Inkscape layers, groups and shapes, named by Inkscape label, then id, then element name. On import, `copyInkscapeTreeAttributes` keeps `inkscape:label` as `data-webgrbl-label` and a layer `inkscape:groupmode` as `data-webgrbl-layer`, since the sanitiser drops Inkscape attributes. Projects imported before this have no labels, so their nodes show the id or element name.

Each node has three icon buttons, all one undo step through `ProjectObjectSvgTextChangeRequested` (the project command saga derives layers for new colours, then puts `ProjectObjectSvgTextChanged`):

- **Eye**: `getSvgTextWithElementDisabled` sets or removes `data-webgrbl-disabled`. `getSvgExpandedDocument` removes those elements after parsing, so the toolpath, G-code, layers, warnings, the artwork frame (object size and selection box) and `isObjectArtworkOutsideBed` all ignore them. The bed draws them as a faint dashed outline in the travel colour, with no fill and no halo, clipped to the bed (`getSvgTextOfDisabledElements` drawn in its own `data-disabled-artwork` group with a `clipPath` from `getObjectBedClipSvgTransform`; when the object is drawn as an image, the `getSvgDisplayText` style rule hides them in the image so only that outline shows). Opening an object's tree scrolls its row into view (`block: 'nearest'`).
- **Colour**: `getSvgTextWithElementColour` writes the palette colour as inline `fill`/`stroke` on every painted shape under the node (a paint of none stays none), so the content joins that colour's layer.
- **Trash**: `getSvgTextWithoutElement` removes the element.

Nodes are addressed by child-index paths (`1.0.2`) from the root. The state lives in the SVG text, so it is saved, exported and undone with the object, and old projects need no migration.

The off-bed note on the Objects row and the red outline on the bed now use the drawn geometry (`isObjectArtworkOutsideBed`), not the SVG page box. An object outside the bed also gets red arrows on each bed edge it crosses (`BedOffBedArrows`, level with the artwork centre held on the bed, two handles long at every zoom), so an object that is mostly off the bed still shows which way it went, and its problems popover offers **Move onto bed** (off when it is larger than the bed) and **Fit to bed** (shrinks it only when needed and centres it), each one undo step.

## Use it from code

Feature code never touches Dexie; it goes through `PROJECT_REPOSITORY` (`src/utils/project/project.repository.ts`) or dispatches an action the sagas handle.

```ts
// Import files the same way the button and the drop do.
dispatch(new SvgFilesImportRequested({ files }));

// Change the document; each action is one undo step.
dispatch(new ProjectObjectsTransformed({ transforms: [{ id, xMm: 20, yMm: 20, widthMm: 40, heightMm: 40, rotationDeg: 0 }] }));
dispatch(new ProjectUndoRequested());

// Project commands and SVG imports go into one queue, so they never run at the same time as an autosave or a switch.
dispatch(new ProjectSaveRequested());
dispatch(new ProjectOpenRequested({ projectId }));
```

- Read the document with `selectProjectObjects`, the selection with `selectSelectedObjectIds` / `selectSelectedObjects` from `project.selection.state.ts`, and the open project with `selectProjectId` / `selectProjectName` / `selectProjectSaveStatus`.
- New objects in tests: `newProjectObject({ xMm: 5 })`.
- Storage errors are logged and shown as fixed toasts; never put raw error text in a toast.

## Try it

`npm run dev`, import an Inkscape SVG, drop a few more, move, scale, rotate, undo, then reload the tab: the project comes back as it was. "Save as file", then "New project" and "Open file...", and delete a project in "Open...".

Manual check in Chrome: done by the user on 2026-11-01 and reported fine.

## Tests

- Sanitiser and size: `src/utils/svg/*.test.ts`. Repository and file format: `project.repository.test.ts`, `project.file.test.ts` (fake-indexeddb). Document state: `project.document.state.test.ts`. Sagas: `svg.import.saga.test.ts`, `project.saga.test.ts`.
- Every `newStore()` starts its sagas on `window` and `document`; tests call `LIVE_STORE_TASK_REGISTRY.cancelLiveStoreTasks()` in teardown so a store never writes to storage during the next test.
