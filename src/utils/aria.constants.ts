/**
 * WAI-ARIA attribute values the app sets on its own widgets.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** The aria-orientation of a separator: vertical between side-by-side panels, horizontal between stacked ones. */
export const ARIA_ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} as const;

/** The role of a short note kept behind an icon, read with its text as the name. */
export const ARIA_ROLE_NOTE = 'note';

/** A live region that announces a problem as soon as it appears. */
export const ARIA_ROLE_ALERT = 'alert';

/** The role of a small badge that stands for a word, read with that word as its name. */
export const ARIA_ROLE_IMG = 'img';

/** The role of a titled workbench section drawn as a card, named by its heading. */
export const ARIA_ROLE_REGION = 'region';
