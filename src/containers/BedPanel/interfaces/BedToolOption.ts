/**
 * One bed tool offered in the tool switch: the tool it picks and the text it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedTool } from '../bed.toolbar.constants';

export interface BedToolOption {
  value: BedTool;
  label: string;
}
