/**
 * The part of a toolpath that the head position at a second of the job needs: the moves and where the job starts.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Toolpath } from './Toolpath';

export type TimelineToolpath = Pick<Toolpath, 'moves' | 'startPoint'>;
