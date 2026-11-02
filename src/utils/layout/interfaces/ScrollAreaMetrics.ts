/**
 * The scroll sizes of a scroll area, in CSS pixels, as an element reports them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export type ScrollAreaMetrics = Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'scrollHeight'>;
