/**
 * A bed tool and the translation key of its label.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedTool } from '../bed.toolbar.constants';

export interface BedToolOptionKey {
  value: BedTool;
  labelKey: string;
}
