import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { SaveHotkey } from '.';
import { SAVE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { ProjectSaveRequested } from '../../utils/states/project.state';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';

const FIELD_LABEL = 'Field';
const OVERLAY_ID = 'test-overlay';

const renderHotkey = (store: AppStore): MockInstance<AppDispatch> => {
  const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

  render(
    <Provider store={store}>
      <SaveHotkey />
      <input aria-label={FIELD_LABEL} />
    </Provider>,
  );

  return dispatchSpy;
};

const getSaveCallCount = (dispatchSpy: MockInstance<AppDispatch>): number =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof ProjectSaveRequested)
    .length;

describe(SaveHotkey.name, () => {
  it('saves on Ctrl+S and prevents the browser default', () => {
    const dispatchSpy: MockInstance<AppDispatch> = renderHotkey(newStore());

    const wasNotPrevented: boolean = fireEvent.keyDown(window, { key: SAVE_KEY, ctrlKey: true });

    expect(wasNotPrevented).toBe(false);
    expect(getSaveCallCount(dispatchSpy)).toBe(1);
  });

  it('saves on Cmd+S', () => {
    const dispatchSpy: MockInstance<AppDispatch> = renderHotkey(newStore());

    fireEvent.keyDown(window, { key: SAVE_KEY, metaKey: true });

    expect(getSaveCallCount(dispatchSpy)).toBe(1);
  });

  it('saves inside a text field and with an overlay open', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = renderHotkey(store);

    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: OVERLAY_ID }));
    });

    const wasNotPrevented: boolean = fireEvent.keyDown(screen.getByLabelText(FIELD_LABEL), {
      key: SAVE_KEY,
      ctrlKey: true,
    });

    expect(wasNotPrevented).toBe(false);
    expect(getSaveCallCount(dispatchSpy)).toBe(1);
  });

  it.each([
    ['S without Ctrl or Cmd', { key: SAVE_KEY }],
    ['Ctrl+Shift+S', { key: SAVE_KEY, ctrlKey: true, shiftKey: true }],
    ['IME composition', { key: SAVE_KEY, ctrlKey: true, isComposing: true }],
  ])('ignores %s', (_label: string, keyInit: KeyboardEventInit) => {
    const dispatchSpy: MockInstance<AppDispatch> = renderHotkey(newStore());

    const wasNotPrevented: boolean = fireEvent.keyDown(window, keyInit);

    expect(wasNotPrevented).toBe(true);
    expect(getSaveCallCount(dispatchSpy)).toBe(0);
  });
});
