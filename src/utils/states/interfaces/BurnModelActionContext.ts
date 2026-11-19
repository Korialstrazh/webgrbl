/**
 * What the burn model saga reads to decide whether a material action touches the model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModelStatus } from '../burn.model.status.constants';

export interface BurnModelActionContext {
  /** The material of the project now. */
  activeMaterialId: string | undefined;
  /** The material of the latest build. */
  builtMaterialId: string | undefined;
  /** Where the model stands after the action. */
  modelStatus: BurnModelStatus;
}
