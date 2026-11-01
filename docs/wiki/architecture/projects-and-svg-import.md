---
title: Projects and SVG import
created: 2026-11-01
---

# Projects and SVG import

A project is the design on the bed: a list of SVG objects with a size, position and rotation in machine millimetres. It lives in the `projectDocument` slice with a snapshot undo history, the selection lives in `projectSelection`, and `SvgFilesImportRequested` turns picked or dropped files into objects through the sanitiser. The UI dispatches the import action from a file picker and from a drop onto the bed.

## Key Takeaways

- **Document.** `ProjectObject` holds `id`, `name`, `svgText` (sanitised), `intrinsicWidthMm` / `intrinsicHeightMm` (size as imported), `xMm`, `yMm`, `widthMm`, `heightMm` and `rotationDeg`. `newProjectObject(overrides)` is the factory (also used by tests). Limits and steps are in `project.constants.ts` (`MAX_PROJECT_OBJECTS` 50, `IMPORT_PLACEMENT_OFFSET_MM` 10, `MAX_UNDO_STEPS` 100, size bounds).
- **Slice `projectDocument`.** State is `{document, past, future}`. Actions: `ProjectObjectsAdded {objects}`, `ProjectObjectsTransformed {transforms}`, `ProjectObjectsDeleted {objectIds}`, `ProjectUndoRequested`, `ProjectRedoRequested`, `ProjectDocumentLoaded {document}` (replaces the document and clears the history). Selectors: `selectProjectDocument`, `selectProjectObjects`, `selectCanUndo`, `selectCanRedo`.
- **History.** Every change pushes the previous document on `past` (capped at `MAX_UNDO_STEPS`) and clears `future`. A change that changes nothing (no objects added, an unchanged transform, deleting unknown ids) records no step. One action is one undo step, so an import of several files is one step.
- **Selection.** `projectSelection` holds `selectedObjectIds`, set by `ProjectSelectionChanged {objectIds}`; ids of objects that leave the document are dropped from it.
- **Import saga `watchSvgImport`.** On `SvgFilesImportRequested {files}` it handles the files in order: a file over `MAX_SVG_FILE_BYTES` (by `File.size`, checked before reading) is rejected; otherwise `readSvgFile` reads `file.text()` and runs `getSanitizedSvg`. A failed read counts as not-svg and its error text is never shown.
- **Placement and names.** After the reads, the saga selects the objects again and places accepted object `i` of the request at `((existingCount + i) mod 10) * 10` mm on X and Y (`IMPORT_PLACEMENT_OFFSET_MM`, `IMPORT_PLACEMENT_CASCADE_LENGTH`), so the first import starts at 0,0 and later imports continue the cascade instead of landing on top. Objects are named after the file without its extension, with a `crypto.randomUUID()` id, scale 1 (width and height equal the intrinsic size) and rotation 0. All accepted objects go out in ONE `ProjectObjectsAdded`, then `ProjectSelectionChanged` selects them. Nothing is dispatched when no file was accepted. The same file imported twice gives two objects with different ids.
- **Limit.** The saga runs under `takeEvery` and reads files asynchronously, so the count can change while it reads (another import, a delete, undo). The count is therefore checked again right before the add: the accepted files are trimmed to the remaining room of 50 objects, and one error toast `TOAST_SVG_IMPORT_LIMIT_REACHED {limit}` shows if any file was trimmed or skipped.
- **Toasts.** Failure: error toast with `{fileName}` and one key per reason, mapped from `SVG_IMPORT_ERROR_KIND` by `SVG_IMPORT_FAILURE_TOAST_KEY` (`TOAST_SVG_IMPORT_FAILED_NOT_SVG`, `_NO_SIZE`, `_TOO_LARGE`); the other files still import. Content removed by the sanitiser: warning `TOAST_SVG_CONTENT_REMOVED {fileName}`. An object wider or taller than the bed (`getBedDimensions` over `selectGrblSettings`, `selectIsConnected` and `selectActiveMachineProfile`, as `BedPanel` does): info `TOAST_SVG_LARGER_THAN_BED {fileName}`. Toast texts never contain parser or error text.
- **Sanitiser.** `getSanitizedSvg(text)` returns `SanitizedSvg {svgText, widthMm, heightMm, removedContentKinds}` or `SvgImportFailure {errorKind}` (`not-svg`, `no-size`, `too-large`); `isSvgImportFailure` tells them apart. It parses with `DOMParser` as `image/svg+xml` and requires an `svg` root in the SVG namespace. It removes scripts, `on*` event attributes, `javascript:` and remote `href`s, remote or escaped CSS references (`url()`, `@import`, `image-set`), animation values that point to remote references, `foreignObject`, linked images (data images of png, jpeg, gif and webp are kept) and editor metadata. Removed visible content is reported once per kind (`foreign-object`, `linked-image`, `style-url`); editor metadata is removed silently. The size comes from `width` and `height` (units mm, cm, in, pt, pc, px) or the `viewBox` (user units as px); no size is `no-size`. Its own length check is a character-count backstop; the byte check is the caller's.
- **Tests.** The saga tests run `newStore()` with real `File` objects and wait with `vi.waitFor` for the expected objects or toast; the sanitiser tests parse in jsdom.

## Source

- `src/utils/project/` (`project.constants.ts`, `new.project.object.ts`, `get.object.corners.ts`, `is.object.outside.bed.ts`, `interfaces/`)
- `src/utils/states/project.document.state.ts`, `src/utils/states/project.selection.state.ts`
- `src/utils/states/svg.import.saga.ts`, `src/utils/states/svg.import.constants.ts`, `src/utils/states/interfaces/SvgFilesPayload.ts`, `AcceptedSvgFile.ts`
- `src/utils/svg/` (`get.sanitized.svg.ts`, `sanitize.svg.element.ts`, `sanitize.svg.attributes.ts`, `read.svg.file.ts`, `get.file.name.without.extension.ts`, `get.svg.physical.size.ts`, `is.svg.import.failure.ts`, `svg.constants.ts`, `interfaces/`)
- `src/utils/states/root.saga.ts`, `src/utils/states/root.reducer.ts`
- `src/utils/bed/get.bed.dimensions.ts`
- `tools/localization/default.csv` (`TOAST_SVG_*`)
