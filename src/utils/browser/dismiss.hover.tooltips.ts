/**
 * Closes the tooltips that hover opened, by telling the element under the pointer that the pointer has left it. After
 * a resize or a view change the layout moves under a still pointer, so no leave event comes and a tooltip would stay
 * where its trigger used to be, floating over other controls.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { HOVERED_ELEMENT_SELECTOR, MOUSE_OUT_EVENT_NAME } from './browser.events.constants';

// Without hover (a touch screen) nothing matches :hover, so the element last entered, if still on the page, stands in.
export const dismissHoverTooltips = (lastEnteredElement?: Element): void => {
  const hoveredElements: NodeListOf<Element> = document.querySelectorAll(HOVERED_ELEMENT_SELECTOR);
  const connectedEnteredElement: Element | undefined = lastEnteredElement?.isConnected ? lastEnteredElement : undefined;
  const innermostHoveredElement: Element | undefined =
    hoveredElements[hoveredElements.length - 1] ?? connectedEnteredElement;

  // With no related target the pointer counts as gone from the page, so every hovered ancestor gets its leave too.
  innermostHoveredElement?.dispatchEvent(new MouseEvent(MOUSE_OUT_EVENT_NAME, { bubbles: true, relatedTarget: null }));
};
