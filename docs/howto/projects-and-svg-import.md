# Projects and SVG import

A project is the design on the bed: SVG objects with a size, position and rotation. Projects are saved in the browser on their own, can be saved as a file and opened again, and survive a reload. This page shows what the user gets, how the numbers work and how to extend it. Design details: `docs/wiki/architecture/projects-and-svg-import.md`.

## What the user gets

- **Import.** The "Import SVG" button (top bar, and in the empty Objects section) and a drop of one or more files on the bed (`SvgImportButton`, `useSvgFileDrop` in `BedPanel`). Each file becomes an object named after the file. A project holds up to 50 objects, a file may be up to 10 MB.
- **Edit.** Select (click, Shift-click, click on empty bed to clear), drag, scale and rotate with the handles, nudge with the arrow keys (1 mm, Shift 10 mm), Delete or Backspace to remove, and X / Y / Width / Height / Rotation fields in the Objects section. The Move tool drags the whole selection from anywhere.
- **Undo and redo.** Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y, and the top bar buttons. 100 steps. One gesture is one step: a drag, a handle gesture, one field commit, and an import of several files.
- **Project menu** (top bar): New project, Open..., Save (Ctrl/Cmd+S), Save as file, Open file.... Click the name to rename it. The autosave readout shows Saved, Saving... or Not saved. Export G-code is still "soon".

## Coordinates

Objects live in the machine frame in millimetres, X to the right and Y up, with the origin at the front-left of the bed. `xMm` / `yMm` are the front-left corner of the box before rotation, and `rotationDeg` turns counter-clockwise around the box centre. `getObjectCorners` gives the rotated corners; `isObjectOutsideBed` uses them, so a rotated object that pokes out of the bed is flagged ("Outside the bed" in the list, a dashed outline on the bed). Placing an object outside the bed is allowed; nothing is clipped.

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
| Project name, times, object transforms | IndexedDB database `webgrbl`, table `projects` | every autosave |
| SVG text of each object | table `svgAssets`, key `[projectId+objectId]` | once, the first save that holds the object |
| Id of the last opened project | table `appState` | when a project opens |
| Machine profiles | `localStorage` (see `docs/howto/machine-control.md`) | not part of a project |

The split keeps an autosave after a nudge small: only the project row is rewritten. A save never deletes SVG rows, because undo can bring a removed object back. Unused rows are deleted when a project opens and when it closes (the history is empty or gone then).

**Autosave timing** (`project.constants.ts`, `project.autosave.saga.ts`): a change marks the project "Not saved"; the save runs 1000 ms after the last change, at the latest 3000 ms after the first unsaved change, and at once when the tab is hidden or the page is left (`visibilitychange`, `pagehide`). A failed save keeps the changes on screen, shows one toast until a save works again, and the next change tries again. If the project was deleted in another tab, the next save stores the document in a new project.

## Project file

"Save as file" downloads `<project name>.webgrbl.json` (characters file systems forbid are left out). It is pretty JSON and self-contained:

```json
{
  "format": "webgrbl-project",
  "version": 1,
  "name": "Coaster",
  "objects": [
    {
      "id": "…", "name": "logo", "svgText": "<svg …/>",
      "intrinsicWidthMm": 40, "intrinsicHeightMm": 40,
      "xMm": 10, "yMm": 10, "widthMm": 40, "heightMm": 40, "rotationDeg": 0
    }
  ]
}
```

"Open file..." (also in the Open dialog) always creates a **new** project with new ids, so a file never overwrites a stored project. Import (`getImportedProjectFile`) rejects the whole file when the format or version is wrong, there are more than 50 objects, a field has the wrong type, or any SVG fails sanitising; it sanitises every SVG again, re-measures the size, clamps the box and brings the rotation into [0, 360). An invalid file shows "The file is not a webgrbl project file. Nothing was opened." and changes nothing. A new file version needs `PROJECT_FILE_VERSION` raised and a reader for the old one.

## Use it from code

Feature code never touches Dexie; it goes through `PROJECT_REPOSITORY` (`src/utils/project/project.repository.ts`) or dispatches an action the sagas handle.

```ts
// Import files the same way the button and the drop do.
dispatch(new SvgFilesImportRequested({ files }));

// Change the document; each action is one undo step.
dispatch(new ProjectObjectsTransformed({ transforms: [{ id, xMm: 20, yMm: 20, widthMm: 40, heightMm: 40, rotationDeg: 0 }] }));
dispatch(new ProjectUndoRequested());

// Project commands go into one queue, so they never run at the same time as an autosave.
dispatch(new ProjectSaveRequested());
dispatch(new ProjectOpenRequested({ projectId }));
```

- Read the document with `selectProjectObjects`, the selection with `selectSelectedObjectIds` / `selectSelectedObjects` from `project.selection.state.ts`, and the open project with `selectProjectId` / `selectProjectName` / `selectProjectSaveStatus`.
- New objects in tests: `newProjectObject({ xMm: 5 })`.
- Storage errors are logged and shown as fixed toasts; never put raw error text in a toast.

## Try it

`npm run dev`, import an Inkscape SVG, drop a few more, move, scale, rotate, undo, then reload the tab: the project comes back as it was. "Save as file", then "New project" and "Open file...", and delete a project in "Open...".

Manual check in Chrome: pending, done by the user after the PR opens.

## Tests

- Sanitiser and size: `src/utils/svg/*.test.ts`. Repository and file format: `project.repository.test.ts`, `project.file.test.ts` (fake-indexeddb). Document state: `project.document.state.test.ts`. Sagas: `svg.import.saga.test.ts`, `project.saga.test.ts`.
- Every `newStore()` starts its sagas on `window` and `document`; tests call `LIVE_STORE_TASK_REGISTRY.cancelLiveStoreTasks()` in teardown so a store never writes to storage during the next test.
