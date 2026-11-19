/**
 * Finds the saved material a new one would copy, by name and thickness. Of several, the one with a test comes first,
 * because that is the one worth using.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from './interfaces/Material';

const getComparableMaterialName = (name: string): string => name.trim().toLowerCase();

export const getMatchingMaterial = (
  materials: Material[],
  { name, thicknessMm }: Pick<Material, 'name' | 'thicknessMm'>,
): Material | undefined => {
  const comparableName: string = getComparableMaterialName(name);
  const matches: Material[] = materials.filter((material: Material): boolean =>
    getComparableMaterialName(material.name) === comparableName && material.thicknessMm === thicknessMm);

  return matches.find(({ testResults }: Material): boolean => !!testResults.length) ?? matches[0];
};
