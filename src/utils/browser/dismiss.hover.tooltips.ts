/**
 * Closes the tooltips that hover opened, by telling the element under the pointer that the pointer has left it. After
 * a resize or a view change the layout moves under a still pointer, so no leave event comes and a tooltip would stay
 * where its trigger used to be, floating over other controls.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { HOVERED_ELEMENT_SELECTOR, MOUSE_OUT_EVENT_NAME } from './browser.events.constants';

export const dismissHoverTooltips = (): void => {
  const hoveredElements: NodeListOf<Element> = document.querySelectorAll(HOVERED_ELEMENT_SELECTOR);
  const innermostHoveredElement: Element | undefined = hoveredElements[hoveredElements.length - 1];

  // With no related target the pointer counts as gone from the page, so every hovered ancestor gets its leave too.
  innermostHoveredElement?.dispatchEvent(new MouseEvent(MOUSE_OUT_EVENT_NAME, { bubbles: true, relatedTarget: null }));
};
