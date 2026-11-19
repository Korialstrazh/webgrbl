/**
 * A straight piece of head movement, in bed mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathMove } from '../../toolpath/interfaces/ToolpathMove';

export type BurnSegment = Pick<ToolpathMove, 'from' | 'to'>;
