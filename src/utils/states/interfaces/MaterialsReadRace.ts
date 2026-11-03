/**
 * The outcome of reading the stored materials against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from '../../materials/interfaces/Material';

export interface MaterialsReadRace {
  /** The materials read from storage when the read finished first. */
  storedMaterials?: Material[];
  /** Set when the timeout ended first, so the materials in the state stay. */
  timeout?: true;
}
