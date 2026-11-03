/**
 * Finds the saved material a new one would copy, by name and thickness. Of several, the one with a test comes first, because that is the one worth using.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
