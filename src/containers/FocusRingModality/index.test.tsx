import { fireEvent, render } from '@testing-library/react';
import { FocusRingModality } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { POINTER_MODALITY_ATTRIBUTE } from './focus.ring.modality.constants';

const TAB_KEY = 'Tab';

const hasPointerModality = (): boolean => document.documentElement.hasAttribute(POINTER_MODALITY_ATTRIBUTE);

describe(FocusRingModality.name, () => {
  it('marks the page after a pointer press and keeps the mark through Escape', () => {
    render(<FocusRingModality />);

    fireEvent.pointerDown(document.body);

    expect(hasPointerModality()).toBe(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(hasPointerModality()).toBe(true);
  });

  it('drops the mark on any other key, so keyboard users get the ring back', () => {
    render(<FocusRingModality />);

    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document.body, { key: TAB_KEY });

    expect(hasPointerModality()).toBe(false);
  });

  it('drops the mark when it unmounts', () => {
    const { unmount } = render(<FocusRingModality />);

    fireEvent.pointerDown(document.body);
    unmount();

    expect(hasPointerModality()).toBe(false);
  });
});
