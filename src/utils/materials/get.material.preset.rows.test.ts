import { describe, expect, it } from 'vitest';
import { getMaterialPresetRows } from './get.material.preset.rows';
import type { Material } from './interfaces/Material';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetRow } from './interfaces/MaterialPresetRow';
import type { MaterialPresetRowFilter } from './interfaces/MaterialPresetRowFilter';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import type { MaterialPresetOperation } from './material.preset.constants';
import { newMaterial } from './new.material';
import { newMaterialPreset } from './new.material.preset';

const PROFILE_A = 'profile-a';
const PROFILE_B = 'profile-b';
const PLYWOOD_NAME = 'Plywood';
const ACRYLIC_NAME = 'Acrylic';
const PLYWOOD: Material = newMaterial({ name: PLYWOOD_NAME, thicknessMm: 3 });
const ACRYLIC: Material = newMaterial({ name: ACRYLIC_NAME, thicknessMm: 5 });

type MaterialPresetOverrides = Partial<MaterialPreset>;

const newPresetFixture = (overrides: MaterialPresetOverrides = {}): MaterialPreset => ({
  ...newMaterialPreset({
    materialId: PLYWOOD.id,
    machineProfileId: PROFILE_A,
    operation: MATERIAL_PRESET_OPERATION.CUT,
    powerWatts: 10,
    speedMmPerMin: 300,
    passes: 1,
    notes: '',
  }),
  ...overrides,
});

const FILTER: MaterialPresetRowFilter = {
  searchText: '',
  machineProfileId: undefined,
  getOperationLabel: (operation: MaterialPresetOperation): string => `label-${operation}`,
};

const getRowNames = (rows: MaterialPresetRow[]): string[] =>
  rows.map(({ materialName }: MaterialPresetRow): string => materialName);

describe(getMaterialPresetRows.name, () => {
  it('sorts by material', () => {
    const presets: MaterialPreset[] = [newPresetFixture(), newPresetFixture({ materialId: ACRYLIC.id })];

    expect(getRowNames(getMaterialPresetRows(presets, [PLYWOOD, ACRYLIC], FILTER)))
      .toEqual([ACRYLIC_NAME, PLYWOOD_NAME]);
  });

  it('keeps to the machine profile when one is given', () => {
    const presets: MaterialPreset[] = [newPresetFixture({ machineProfileId: PROFILE_B })];

    expect(getMaterialPresetRows(presets, [PLYWOOD], { ...FILTER, machineProfileId: PROFILE_A })).toEqual([]);
    expect(getMaterialPresetRows(presets, [PLYWOOD], { ...FILTER, machineProfileId: PROFILE_B })).toHaveLength(1);
  });

  it('needs every search word, in any field and any case', () => {
    const presets: MaterialPreset[] = [newPresetFixture()];

    expect(getMaterialPresetRows(presets, [PLYWOOD], { ...FILTER, searchText: ' PLY  label-cut 3 ' })).toHaveLength(1);
    expect(getMaterialPresetRows(presets, [PLYWOOD], { ...FILTER, searchText: 'ply shade' })).toEqual([]);
  });

  it('leaves out a preset whose material is not known', () => {
    expect(getMaterialPresetRows([newPresetFixture()], [ACRYLIC], FILTER)).toEqual([]);
  });
});
