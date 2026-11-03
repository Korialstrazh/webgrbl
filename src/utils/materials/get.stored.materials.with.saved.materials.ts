/**
 * Gets the stored materials with the materials held in the state taking the place of their stored copies, and those not
 * stored added at the end. A material in the state may be newer than storage, or its store may have failed, and it must
 * stay on screen either way.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from './interfaces/Material';

export const getStoredMaterialsWithSavedMaterials = (
  storedMaterials: Material[],
  savedMaterials: Material[],
): Material[] => {
  const savedMaterialsById: Map<string, Material> = new Map<string, Material>();

  for (const savedMaterial of savedMaterials) {
    savedMaterialsById.set(savedMaterial.id, savedMaterial);
  }

  const storedMaterialIds: Set<string> =
    new Set<string>(storedMaterials.map((material: Material): string => material.id));

  return [
    ...storedMaterials.map((material: Material): Material => savedMaterialsById.get(material.id) ?? material),
    ...savedMaterials.filter((material: Material): boolean => !storedMaterialIds.has(material.id)),
  ];
};
