import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HistoryHotkeys } from '.';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectObjectsAdded, selectCanRedo, selectProjectObjects } from '../../utils/states/project.document.state';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';

const UNDO_KEY_NAME = 'z';
const REDO_KEY_NAME = 'y';
const FIELD_LABEL = 'Field';
const OVERLAY_ID = 'test-overlay';

const renderHotkeys = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <HistoryHotkeys />
      <input aria-label={FIELD_LABEL} />
    </Provider>,
  );
};

const addObject = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()] }));
  });
};

const getObjectCount = (store: AppStore): number => selectProjectObjects(store.getState()).length;

describe(HistoryHotkeys.name, () => {
  it('undoes on Ctrl+Z and prevents the browser default', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);

    const wasNotPrevented: boolean = fireEvent.keyDown(window, { key: UNDO_KEY_NAME, ctrlKey: true });

    expect(wasNotPrevented).toBe(false);
    expect(getObjectCount(store)).toBe(0);
  });

  it('undoes on Cmd+Z', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);
    fireEvent.keyDown(window, { key: UNDO_KEY_NAME, metaKey: true });

    expect(getObjectCount(store)).toBe(0);
  });

  it.each([
    ['Ctrl+Y', { key: REDO_KEY_NAME, ctrlKey: true }],
    ['Ctrl+Shift+Z', { key: 'Z', ctrlKey: true, shiftKey: true }],
  ])('redoes on %s', (_label: string, keyInit: KeyboardEventInit) => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);
    fireEvent.keyDown(window, { key: UNDO_KEY_NAME, ctrlKey: true });

    expect(selectCanRedo(store.getState())).toBe(true);

    fireEvent.keyDown(window, keyInit);

    expect(getObjectCount(store)).toBe(1);
  });

  it('ignores keys without Ctrl or Cmd', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);

    const wasNotPrevented: boolean = fireEvent.keyDown(window, { key: UNDO_KEY_NAME });

    expect(wasNotPrevented).toBe(true);
    expect(getObjectCount(store)).toBe(1);
  });

  it('does not undo while focus is in a text field', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);
    fireEvent.keyDown(screen.getByLabelText(FIELD_LABEL), { key: UNDO_KEY_NAME, ctrlKey: true });

    expect(getObjectCount(store)).toBe(1);
  });

  it('does not undo while an overlay is open', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: OVERLAY_ID }));
    });
    fireEvent.keyDown(window, { key: UNDO_KEY_NAME, ctrlKey: true });

    expect(getObjectCount(store)).toBe(1);
  });

  it('does not undo during IME composition', () => {
    const store: AppStore = newStore();

    renderHotkeys(store);
    addObject(store);
    fireEvent.keyDown(window, { key: UNDO_KEY_NAME, ctrlKey: true, isComposing: true });

    expect(getObjectCount(store)).toBe(1);
  });
});
