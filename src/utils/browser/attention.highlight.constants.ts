/**
 * The attribute that turns on the brief attention glow and how long it lasts. They must match the attention-highlight
 * rule in global.styles.scss. An attribute, not a class: React rewrites the class names of a component it renders
 * again, which would drop the glow at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const ATTENTION_HIGHLIGHT_ATTRIBUTE = 'data-attention-highlight';

export const ATTENTION_HIGHLIGHT_DURATION_MS = 1600;
