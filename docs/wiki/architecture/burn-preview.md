---
title: Burn preview
created: 2026-11-03
---

# Burn preview

The burn preview predicts depth from a test the user made on a real sheet. This article covers its foundation so far: materials, their storage, and how a project and a project file refer to a material. See also [[projects-and-svg-import]] and [[layers-and-gcode]].

## Key Takeaways

- **Model.** `Material` is `id`, `name`, `thicknessMm` and `testResults`. A `MaterialTestResult` belongs to one machine profile, because lasers differ; `getMaterialWithTestResult` keeps at most one per profile.
- **Storage.** Dexie table `materials` (key `id`, added in database version 2). `MATERIAL_REPOSITORY` is the only access. `listMaterials` leaves out rows that are not well-formed.
- **Slice `material`.** State `{ materials }`. Actions: `MaterialsLoaded`, `MaterialSaved` (upsert by id), `MaterialTestResultSaved` (unknown material ignored). Selector `selectMaterials`.
- **Active material.** `selectActiveMaterial` finds the material of the document's `materialId`; it is undefined with no id or a missing material. `selectActiveMaterialTestResult` returns only the result of the active machine profile, so switching profile never uses another laser's result.
- **Saga `watchMaterials`.** It starts listening before it reads, so a save during a slow read still reaches storage. The read races `PANEL_SIZES_READ_TIMEOUT_MS`; a timeout or failure keeps the state. Materials saved during the read win over their stored copies. Every save stores at once; a failure logs the error and shows the fixed `TOAST_MATERIAL_SAVE_FAILED`, with no automatic retry.
- **Project.** `ProjectDocument` and `StoredProject` hold an optional `materialId`, not a copy. `ProjectMaterialSelected` is one undo step, a repeat makes no step, and it autosaves. A stored id that is not text reads as none.
- **Project file version 3.** Adds optional `materialId` and `material` (an embedded copy) after `layers`. Versions 1 and 2 still open, with no material; a stray `material` in them is ignored.
- **Import.** `isMaterial` checks types only. `getImportedMaterial` then copies known fields, trims and cuts the name, and clamps thickness and test settings, so a speed of 0 cannot make a test dose infinite. An empty id or name rejects the file with `TOAST_PROJECT_FILE_INVALID`. The document points at the embedded material if the two ids differ.
- **Existing id wins.** `importProjectFile` calls `addMissingMaterial` before storing the project, then reloads with `MaterialsLoaded`. A local material with the same id keeps its name and results.

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
