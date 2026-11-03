/**
 * What a burn model is built from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
