/**
 * What the MaterialsLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from '../../materials/interfaces/Material';

export interface MaterialsPayload {
  /** Every known material, replacing the ones in the state. */
  materials: Material[];
}
