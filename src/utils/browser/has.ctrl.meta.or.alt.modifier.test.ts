import { hasCtrlMetaOrAltModifier } from './has.ctrl.meta.or.alt.modifier';

describe(hasCtrlMetaOrAltModifier.name, () => {
  it.each([
    ['Ctrl', { ctrlKey: true }, true],
    ['Cmd', { metaKey: true }, true],
    ['Alt', { altKey: true }, true],
    ['Shift alone', { shiftKey: true }, false],
    ['no modifier', {}, false],
  ])('gives %s as %s', (_label: string, modifiers: KeyboardEventInit, expected: boolean) => {
    expect(hasCtrlMetaOrAltModifier(new KeyboardEvent('keydown', modifiers))).toBe(expected);
  });
});
