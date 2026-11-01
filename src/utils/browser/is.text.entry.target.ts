/**
 * Tells whether a key event target is a place where the user types text: an input, a textarea, or an element inside
 * a contenteditable region. Keyboard shortcuts stay out of the way there, so Delete or Ctrl+Z edit the text instead of
 * the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CONTENT_EDITABLE_REGION_SELECTOR } from './browser.events.constants';

const isTextFieldElement = (target: EventTarget): boolean =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

// jsdom has no isContentEditable, so the editable region is found by its attribute instead.
const isInsideContentEditableRegion = (target: EventTarget): boolean =>
  target instanceof Element && !!target.closest(CONTENT_EDITABLE_REGION_SELECTOR);

export const isTextEntryTarget = (target: EventTarget | null): boolean =>
  !!target && (isTextFieldElement(target) || isInsideContentEditableRegion(target));
