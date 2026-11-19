/**
 * The scroll sizes of a scroll area, in CSS pixels, as an element reports them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export type ScrollAreaMetrics = Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'scrollHeight'>;
