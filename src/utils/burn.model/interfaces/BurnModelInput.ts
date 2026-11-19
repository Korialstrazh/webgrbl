/**
 * What a burn model is built from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { MaterialTestResult } from '../../materials/interfaces/MaterialTestResult';
import type { Toolpath } from '../../toolpath/interfaces/Toolpath';

export interface BurnModelInput {
  /** The job to preview. */
  toolpath: Toolpath;
  /** The layers of the project. */
  layers: ProjectLayer[];
  /** Thickness of the sheet in mm. */
  thicknessMm: number;
  /** The test of this material on this machine; undefined when the estimate is a guess. */
  testResult: MaterialTestResult | undefined;
}
