import { hasCommandModifier } from './has.command.modifier';

describe(hasCommandModifier.name, () => {
  it.each([
    ['Ctrl', { ctrlKey: true, metaKey: false, altKey: false }, true],
    ['Cmd', { ctrlKey: false, metaKey: true, altKey: false }, true],
    ['Ctrl+Alt', { ctrlKey: true, metaKey: false, altKey: true }, false],
    ['Alt alone', { ctrlKey: false, metaKey: false, altKey: true }, false],
    ['no modifier', { ctrlKey: false, metaKey: false, altKey: false }, false],
  ])('gives %s as %s', (_label: string, modifiers: KeyboardEventInit, expected: boolean) => {
    expect(hasCommandModifier(new KeyboardEvent('keydown', modifiers))).toBe(expected);
  });
});
