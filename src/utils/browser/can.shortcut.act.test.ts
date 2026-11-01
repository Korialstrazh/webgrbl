import { canShortcutAct } from './can.shortcut.act';

const SHORTCUT_KEY = 'z';

const newKeyboardEvent = (keyboardEventInit: KeyboardEventInit = {}): KeyboardEvent =>
  new KeyboardEvent('keydown', { key: SHORTCUT_KEY, ...keyboardEventInit });

const getEventFromElement = (element: HTMLElement): KeyboardEvent => {
  let dispatchedEvent: KeyboardEvent = newKeyboardEvent();

  element.addEventListener('keydown', (keyboardEvent: KeyboardEvent): void => {
    dispatchedEvent = keyboardEvent;
  });
  element.dispatchEvent(newKeyboardEvent({ bubbles: true }));

  return dispatchedEvent;
};

describe(canShortcutAct.name, () => {
  it('lets a shortcut act on a plain key press with no overlay open', () => {
    expect(canShortcutAct(newKeyboardEvent(), false)).toBe(true);
  });

  it('stops a shortcut while an overlay is open', () => {
    expect(canShortcutAct(newKeyboardEvent(), true)).toBe(false);
  });

  it('stops a shortcut during IME composition', () => {
    expect(canShortcutAct(newKeyboardEvent({ isComposing: true }), false)).toBe(false);
  });

  it('stops a shortcut pressed in a text field', () => {
    const inputElement: HTMLElement = document.createElement('input');

    document.body.append(inputElement);

    expect(canShortcutAct(getEventFromElement(inputElement), false)).toBe(false);

    inputElement.remove();
  });
});
