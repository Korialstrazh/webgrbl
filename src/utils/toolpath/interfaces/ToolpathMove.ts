/**
 * One move of the laser head in bed millimetres: a travel with the laser off, or a burn at a power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { ToolpathMoveKind } from '../toolpath.constants';

export interface ToolpathMove {
  /** Whether the head travels with the laser off or burns. */
  kind: ToolpathMoveKind;
  /** Where the move starts; always where the previous move ended. */
  from: GeometryPoint;
  /** Where the move ends. */
  to: GeometryPoint;
  /** Laser power in percent of the machine maximum; 0 for travel. */
  powerPercent: number;
  /** Feed rate of the layer in mm per minute. */
  feedMmPerMin: number;
  /** Key of the layer the move belongs to. */
  layerKey: string;
  /** Whether air assist is on for the layer. */
  airAssist: boolean;
}
