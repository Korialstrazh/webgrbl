/**
 * The fields every move of one layer shares.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathMove } from './ToolpathMove';

export type ToolpathMoveStyle = Pick<ToolpathMove, 'layerKey' | 'feedMmPerMin' | 'airAssist'>;
