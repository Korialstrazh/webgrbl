# Material library

Presets hold the power, speed and passes that work for a material on one machine. The design is in `docs/superpowers/specs/2026-11-04_(01)_material-library.spec.md`.

- **Where things live:** model and file handling in `src/utils/materials/`, state in `src/utils/states/material.preset.*`, UI in `src/containers/MaterialLibraryDialog/`.
- **Storage:** the `materialPresets` Dexie table. Only `MATERIAL_PRESET_REPOSITORY` touches it, and `watchMaterialPresets` keeps it in step with the state.
- **Add a field to a preset:** change `MaterialPreset`, `isMaterialPreset` and the form. Stored rows without the field are left out by the guard, so give old rows a Dexie upgrade. Also update the file format, and raise `MATERIAL_PRESETS_FILE_VERSION` if old files can no longer be read.
- **Power:** always stored in watts. Convert with `getPresetLayerSettingsChange` (to a layer) and `newMaterialPresetFromLayer` (from a layer). `getImportedMaterialPresets` rescales a file for the importing laser.
