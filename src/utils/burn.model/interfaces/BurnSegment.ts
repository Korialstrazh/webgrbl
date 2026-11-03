/**
 * A straight piece of head movement, in bed mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathMove } from '../../toolpath/interfaces/ToolpathMove';

export type BurnSegment = Pick<ToolpathMove, 'from' | 'to'>;
