/**
 * The attribute that turns on the brief attention glow and how long it lasts. They must match the attention-highlight
 * rule in global.styles.scss. An attribute, not a class: React rewrites the class names of a component it renders
 * again, which would drop the glow at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const ATTENTION_HIGHLIGHT_ATTRIBUTE = 'data-attention-highlight';

export const ATTENTION_HIGHLIGHT_DURATION_MS = 1600;
