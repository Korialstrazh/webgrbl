/**
 * One choice of the Toolpath view colour switch: the mode it sets and the translation key of its label.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathDisplayMode } from '../../../utils/toolpath/toolpath.drawing.constants';

export interface ToolpathDisplayModeOption {
  value: ToolpathDisplayMode;
  labelKey: string;
}
