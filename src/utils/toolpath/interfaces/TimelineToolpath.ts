/**
 * The part of a toolpath that the head position at a second of the job needs: the moves and where the job starts.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Toolpath } from './Toolpath';

export type TimelineToolpath = Pick<Toolpath, 'moves' | 'startPoint'>;
