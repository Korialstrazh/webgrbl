/**
 * What a toolpath generation is built from: the drawables and warnings read on the main thread, and the layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { BedDrawableSet } from './BedDrawableSet';
import type { ToolpathMachineArea } from './ToolpathMachineArea';

export interface ToolpathGenerationInput extends BedDrawableSet {
  /** The layers of the project in burn order; off layers are left out of the toolpath. */
  layers: ProjectLayer[];
  /** The machine the toolpath is made for. */
  machineArea: ToolpathMachineArea;
}
