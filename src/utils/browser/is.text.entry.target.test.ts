import { isTextEntryTarget } from './is.text.entry.target';

const CONTENT_EDITABLE_ATTRIBUTE = 'contenteditable';

const newElement = (tagName: string): HTMLElement => document.createElement(tagName);

const newContentEditableElement = (editableValue: string): HTMLElement => {
  const editableElement: HTMLElement = newElement('div');

  editableElement.setAttribute(CONTENT_EDITABLE_ATTRIBUTE, editableValue);

  return editableElement;
};

describe(isTextEntryTarget.name, () => {
  it('is true for an input', () => {
    expect(isTextEntryTarget(newElement('input'))).toBe(true);
  });

  it('is true for a textarea', () => {
    expect(isTextEntryTarget(newElement('textarea'))).toBe(true);
  });

  it('is true for a contenteditable element and for an element inside one', () => {
    const editableElement: HTMLElement = newContentEditableElement('true');
    const innerElement: HTMLElement = newElement('span');

    editableElement.append(innerElement);

    expect(isTextEntryTarget(editableElement)).toBe(true);
    expect(isTextEntryTarget(innerElement)).toBe(true);
  });

  it('is false for an element whose contenteditable is false', () => {
    expect(isTextEntryTarget(newContentEditableElement('false'))).toBe(false);
  });

  it('is false for a button, a plain element and an SVG element', () => {
    expect(isTextEntryTarget(newElement('button'))).toBe(false);
    expect(isTextEntryTarget(newElement('div'))).toBe(false);
    expect(isTextEntryTarget(document.createElementNS('http://www.w3.org/2000/svg', 'g'))).toBe(false);
  });

  it('is false for no target and for a target that is not an element', () => {
    expect(isTextEntryTarget(null)).toBe(false);
    expect(isTextEntryTarget(window)).toBe(false);
  });
});
