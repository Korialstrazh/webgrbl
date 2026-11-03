/**
 * What the test sample job is built from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Palette } from '../../palette/interfaces/Palette';
import type { ToolpathMachineArea } from '../../toolpath/interfaces/ToolpathMachineArea';
import type { SampleCutSettings } from './SampleCutSettings';

export interface SampleJobInput {
  /** The entered settings of the cut. */
  cutSettings: SampleCutSettings;
  /** The palette the layers are made from. */
  palette: Palette;
  /** The machine the sample is placed on, so it sits at the origin corner. */
  machineArea: ToolpathMachineArea;
}
