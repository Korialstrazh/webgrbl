/**
 * The outcome of reading the stored materials against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from '../../materials/interfaces/Material';

export interface MaterialsReadRace {
  /** The materials read from storage when the read finished first. */
  storedMaterials?: Material[];
  /** Set when the timeout ended first, so the materials in the state stay. */
  timeout?: true;
}
