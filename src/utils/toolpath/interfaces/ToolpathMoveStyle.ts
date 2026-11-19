/**
 * The fields every move of one layer shares.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathMove } from './ToolpathMove';

export type ToolpathMoveStyle = Pick<ToolpathMove, 'layerKey' | 'feedMmPerMin' | 'airAssist'>;
