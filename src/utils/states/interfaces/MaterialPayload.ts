/**
 * What the MaterialSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../../materials/interfaces/Material';

export interface MaterialPayload {
  /** The material to add, or to replace when its id already exists. */
  material: Material;
}
