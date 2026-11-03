---
title: Burn preview
created: 2026-11-03
---

# Burn preview

The burn preview predicts depth from a test the user made on a real sheet. This article covers its foundation so far: materials, their storage, how a project and a project file refer to a material, and the burn model built from them. See also [[projects-and-svg-import]] and [[layers-and-gcode]].

## Key Takeaways

- **Model.** `Material` is `id`, `name`, `thicknessMm` and `testResults`. A `MaterialTestResult` belongs to one machine profile, because lasers differ; `getMaterialWithTestResult` keeps at most one per profile.
- **Storage.** Dexie table `materials` (key `id`, added in database version 2). `MATERIAL_REPOSITORY` is the only access. `listMaterials` leaves out rows that are not well-formed.
- **Slice `material`.** State `{ materials }`. Actions: `MaterialsLoaded`, `MaterialSaved` (upsert by id), `MaterialTestResultSaved` (unknown material ignored). Selector `selectMaterials`.
- **Active material.** `selectActiveMaterial` finds the material of the document's `materialId`; it is undefined with no id or a missing material. `selectActiveMaterialTestResult` returns only the result of the active machine profile, so switching profile never uses another laser's result.
- **Saga `watchMaterials`.** It starts listening before it reads, so a save during a slow read still reaches storage. The read races `PANEL_SIZES_READ_TIMEOUT_MS`; a timeout or failure keeps the state. Materials saved during the read win over their stored copies. Every save stores at once; a failure logs the error and shows the fixed `TOAST_MATERIAL_SAVE_FAILED`, with no automatic retry.
- **Project.** `ProjectDocument` and `StoredProject` hold an optional `materialId`, not a copy. `ProjectMaterialSelected` is one undo step, a repeat makes no step, and it autosaves. It is not a toolpath input: a ready toolpath stays ready and the simulation keeps its time (`PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES`). Undoing it is, like every undo. A stored id that is not text reads as none.
- **Project file version 3.** Adds optional `materialId` and `material` (an embedded copy) after `layers`. Versions 1 and 2 still open, with no material; a stray `material` in them is ignored.
- **Import.** `isMaterial` checks types only. `getImportedMaterial` then copies known fields, trims and cuts the name, and clamps thickness and test settings, so a speed of 0 cannot make a test dose infinite. An empty id or name rejects the file with `TOAST_PROJECT_FILE_INVALID`. The document points at the embedded material if the two ids differ.
- **Existing id wins.** `importProjectFile` calls `addMissingMaterial` before storing the project, then reloads with `MaterialsLoaded`, keeping materials on screen whose store failed. A local material with the same id keeps its name and results.
- **Depth estimate.** `getBurnDepthBasis` turns the test result into a depth per dose (dose = power / feed); `getBurnDepthPrediction` gives depth, level (through, borderline, not through) and sureness. With no test the estimate is `GUESS_DEPTH_MM_PER_DOSE`, and no cell ever counts as through.
- **Grid.** `getBurnDoseGrid` keeps the dose per cell of the sheet (job bounds + 10 mm, at most 1,000,000 cells, at least 0.1 mm). Floods use `visitBurnGridNeighbourCells`, a callback rather than a list: a list per cell cost 15-20 % of a 100,000-move build.
- **Parts.** `getBurnParts` finds the regions closed cuts enclose, their status and a parent tree by `parentId`. `FREE` and `BORDERLINE` parts can lift (`isBurnPartLiftable`); a `NOT_THROUGH` part cannot.
- **Meshes.** `getBurnRegionMeshes` gives the sheet first, then one mesh per liftable part. Height 0 is the sheet bottom and the thickness its untouched top; through cells have no geometry; depths round to `BURN_DEPTH_QUANTUM_MM`; quads merge along rows. A `NOT_THROUGH` part goes to its nearest liftable ancestor, else the sheet. A remaining wall goes to the outermost mesh it touches, so an engraving rises with its part and the wall of a borderline part stays behind. A cell that is not through keeps a floor one step high, however deep its estimate.
- **Triangle cap.** Over `BURN_MESH_MAX_TRIANGLES` (2,000,000) the surface doubles its cell size until it fits. A block with any through cell is empty, so cuts stay open and only look wider. Quads are counted first, then written to exact-size arrays.
- **Worker.** `BrowserBurnModelWorkerClient` mirrors the toolpath client: a cancel terminates the worker, a request id guards answers. `runBurnModelWorkerRequest` hands the mesh buffers over as transferables; an error is a fixed-shape message and its text only reaches the log.
- **Slice `burnModel`.** Status `IDLE`, `BUILDING`, `READY`, `STALE`, `FAILED`. `BurnModelReady` clears selection and lifts. `ToolpathRequested`, `ToolpathMachineAreaChanged`, every document change, and also a material edit, test result or profile selection make a ready model stale, whatever the view. Lifts clamp to 0 to 4 x thickness and change nothing in the project; `selectBurnPartEffectiveLiftMm` adds the lifts of all ancestors. A build stopped by one of those changes or by a view change leaves `BUILDING`.
- **Saga `watchBurnModel`.** Builds while `selectBedViewMode` is 3D, a material exists and the toolpath is ready. `takeLatest` also hears the toolpath input changes: these build nothing but cancel a running build. A material change is not a toolpath input, so it rebuilds directly. A view change with a ready model builds nothing, which keeps the lifts. A failure logs and shows `TOAST_BURN_MODEL_FAILED`.
- **Selecting and staleness by material.** `BurnModelRequested` carries the material id, kept as `builtMaterialId`. Only a save or test result of that material, or selecting a different one, makes the model stale. `watchBurnModel` is a take loop instead of `takeLatest`, because an ignored action must not cancel a running build: a save or result of another material, the same material selected again, and `MaterialsLoaded` while the model is ready or building. `MaterialsLoaded` otherwise builds, so materials read after 3D opened still give a model.
- **Scene and lazy chunk.** `BurnPreviewPane` loads `burn.scene.runtime` with three.js in a lazy chunk. A failed load or no WebGL shows the fixed `BURN_PREVIEW_NO_WEBGL`, and everything outside the scene keeps working.
- **Empty state.** `selectBurnPreviewEmptyState` says why there is no current model: `NO_MATERIAL`, `OUT_OF_DATE` (model stale or toolpath not ready), `FAILED` or `BUILDING`; undefined for a ready model. The pane and the Cut check both word it, so neither shows old parts as current. The pane also offers Add material.
- **Cut check.** `CutCheckPanel` sits above Layers in `DesignPanel` in 3D, where Objects is hidden. It has the counts, one row per part (the only way to select a not-through part, which has no mesh), warnings from `getCutCheckWarningText`, and the estimate or guess note. Warnings never block export.
- **Toolbar and first material.** `BurnPreviewToolbar` in the 3D header selects the material and opens `MaterialDialog`, which validates with `getMaterialFieldErrors`, then dispatches `MaterialSaved` and `ProjectMaterialSelected`. Burn test sample stays disabled until the sample dialog exists. An existing material cannot be edited yet.
- **SVG drop in 3D.** There is no bed, so `useSvgFileDrop(false)` refuses the drag and imports nothing, while still stopping the browser from opening the file.

## Source

- `src/utils/materials/`
- `src/utils/states/material.state.ts`
- `src/utils/states/material.selectors.ts`
- `src/utils/states/material.saga.ts`
- `src/utils/states/project.document.state.ts`
- `src/utils/states/project.file.export.saga.ts`
- `src/utils/states/project.file.import.saga.ts`
- `src/utils/project/project.repository.ts`
- `src/utils/project/get.imported.project.file.ts`
- `src/utils/project/get.project.file.text.ts`
- `src/utils/project/is.project.file.ts`
- `src/utils/project/is.project.file.without.material.ts`
- `src/utils/get.number.in.range.ts`
- `src/utils/states/project.document.change.action.types.ts`
- `src/utils/burn.model/`
- `src/utils/bed/bed.view.constants.ts`
- `src/utils/states/bed.view.state.ts`
- `src/utils/states/burn.model.state.ts`
- `src/utils/states/burn.model.status.constants.ts`
- `src/utils/states/burn.model.saga.ts`
- `src/utils/states/burn.preview.selectors.ts`
- `src/utils/states/burn.preview.empty.state.constants.ts`
- `src/containers/BurnPreviewPane/`
- `src/containers/BurnPreviewToolbar/`
- `src/containers/CutCheckPanel/`
- `src/containers/MaterialDialog/`
- `src/containers/BedPanel/use.svg.file.drop.ts`
