/**
 * Gets the rows of the material library table, sorted by material and thickness. A preset whose material is not known
 * has nothing to show and is left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from './interfaces/Material';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetRow } from './interfaces/MaterialPresetRow';
import type { MaterialPresetRowFilter } from './interfaces/MaterialPresetRowFilter';

const SEARCH_WORD_SEPARATOR = /\s+/;

const getSearchWords = (searchText: string): string[] =>
  searchText.trim().toLowerCase().split(SEARCH_WORD_SEPARATOR).filter(Boolean);

const isPresetOnListedMachine = ({ machineProfileId }: MaterialPreset, listedProfileId: string | undefined): boolean =>
  !listedProfileId || machineProfileId === listedProfileId;

const compareMaterialPresetRows = (firstRow: MaterialPresetRow, secondRow: MaterialPresetRow): number =>
  firstRow.materialName.localeCompare(secondRow.materialName) || firstRow.thicknessMm - secondRow.thicknessMm;

export const getMaterialPresetRows = (
  presets: MaterialPreset[],
  materials: Material[],
  { searchText, machineProfileId, getOperationLabel }: MaterialPresetRowFilter,
): MaterialPresetRow[] => {
  const searchWords: string[] = getSearchWords(searchText);
  const rows: MaterialPresetRow[] = [];

  for (const preset of presets) {
    const material: Material | undefined = materials.find(({ id }: Material): boolean => id === preset.materialId);

    if (material && isPresetOnListedMachine(preset, machineProfileId)) {
      const rowText: string =
        [material.name, material.thicknessMm, getOperationLabel(preset.operation)].join(' ').toLowerCase();

      if (searchWords.every((word: string): boolean => rowText.includes(word))) {
        rows.push({ preset, materialName: material.name, thicknessMm: material.thicknessMm });
      }
    }
  }

  return rows.sort(compareMaterialPresetRows);
};
