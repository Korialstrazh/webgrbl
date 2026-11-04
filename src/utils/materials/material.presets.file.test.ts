import { describe, expect, it } from 'vitest';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { getImportedMaterialPresets } from './get.imported.material.presets';
import { getMaterialPresetsFileText } from './get.material.presets.file.text';
import type { ImportedMaterialPresets } from './interfaces/ImportedMaterialPresets';
import type { Material } from './interfaces/Material';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetsFile } from './interfaces/MaterialPresetsFile';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterial } from './new.material';
import { newMaterialPreset } from './new.material.preset';

type MaterialPresetFileChange = Record<string, unknown>;

const PLYWOOD_NAME = 'Plywood';
const PLYWOOD_THICKNESS_MM = 3;
const PRESET_SPEED_MM_PER_MIN = 300;
const PRESET_PASSES = 2;
const PRESET_NOTES = 'Air assist on';

const SOURCE_PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: 10 });
const TARGET_PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: 40 });
const PLYWOOD: Material = newMaterial({ name: PLYWOOD_NAME, thicknessMm: PLYWOOD_THICKNESS_MM });
const PRESET: MaterialPreset = newMaterialPreset({
  materialId: PLYWOOD.id,
  machineProfileId: SOURCE_PROFILE.id,
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: PRESET_SPEED_MM_PER_MIN,
  passes: PRESET_PASSES,
  notes: PRESET_NOTES,
});
const FILE_TEXT: string = getMaterialPresetsFileText([PRESET], [PLYWOOD], [SOURCE_PROFILE]);

const getFileWithPresetChange = (change: MaterialPresetFileChange): string => {
  const parsedFile: MaterialPresetsFile = JSON.parse(FILE_TEXT) as MaterialPresetsFile;

  return JSON.stringify({ ...parsedFile, presets: [{ ...parsedFile.presets[0], ...change }] });
};

describe(getImportedMaterialPresets.name, () => {
  it('keeps the share of the source laser on the importing machine', () => {
    const importedPresets: ImportedMaterialPresets | undefined =
      getImportedMaterialPresets(FILE_TEXT, [PLYWOOD], TARGET_PROFILE);

    expect(importedPresets?.presets).toEqual([expect.objectContaining({
      machineProfileId: TARGET_PROFILE.id,
      materialId: PLYWOOD.id,
      powerWatts: 20,
      speedMmPerMin: PRESET_SPEED_MM_PER_MIN,
      passes: PRESET_PASSES,
      notes: PRESET_NOTES,
    })]);
    expect(importedPresets?.presets[0]?.id).not.toBe(PRESET.id);
    expect(importedPresets?.newMaterials).toEqual([]);
  });

  it('adds a missing material once for several presets', () => {
    const parsedFile: MaterialPresetsFile = JSON.parse(FILE_TEXT) as MaterialPresetsFile;
    const twoPresetsText: string =
      JSON.stringify({ ...parsedFile, presets: [parsedFile.presets[0], parsedFile.presets[0]] });
    const importedPresets: ImportedMaterialPresets | undefined =
      getImportedMaterialPresets(twoPresetsText, [], TARGET_PROFILE);

    expect(importedPresets?.newMaterials).toEqual([
      expect.objectContaining({ name: PLYWOOD_NAME, thicknessMm: PLYWOOD_THICKNESS_MM }),
    ]);
    expect(importedPresets?.presets.map(({ materialId }: MaterialPreset): string => materialId))
      .toEqual([importedPresets?.newMaterials[0]?.id, importedPresets?.newMaterials[0]?.id]);
  });

  it('never gives more power than the importing laser has', () => {
    const importedPresets: ImportedMaterialPresets | undefined =
      getImportedMaterialPresets(getFileWithPresetChange({ powerWatts: 500 }), [PLYWOOD], TARGET_PROFILE);

    expect(importedPresets?.presets[0]?.powerWatts).toBe(TARGET_PROFILE.maxPowerWatts);
  });

  it('brings speed and passes into range', () => {
    const importedPresets: ImportedMaterialPresets | undefined = getImportedMaterialPresets(
      getFileWithPresetChange({ speedMmPerMin: 0, passes: 999 }),
      [PLYWOOD],
      TARGET_PROFILE,
    );

    expect(importedPresets?.presets[0]).toEqual(expect.objectContaining({ speedMmPerMin: 1, passes: 50 }));
  });

  it.each([
    ['not JSON', 'nonsense'],
    ['another JSON file', '{"profiles":[]}'],
    ['no presets', JSON.stringify({ ...JSON.parse(FILE_TEXT), presets: [] })],
    ['a source power of zero', getFileWithPresetChange({ sourceMaxPowerWatts: 0 })],
    ['an unknown operation', getFileWithPresetChange({ operation: 'melt' })],
    ['an empty material name', getFileWithPresetChange({ materialName: '  ' })],
  ])('rejects %s', (_caseName: string, fileText: string) => {
    expect(getImportedMaterialPresets(fileText, [PLYWOOD], TARGET_PROFILE)).toBeUndefined();
  });
});

describe(getMaterialPresetsFileText.name, () => {
  it('leaves out a preset whose machine is not known', () => {
    expect(JSON.parse(getMaterialPresetsFileText([PRESET], [PLYWOOD], [])).presets).toEqual([]);
  });
});
