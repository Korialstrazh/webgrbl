import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { PaletteDialog } from '.';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../../utils/palette/new.palette.entry';
import {
  CUT_ENTRY_ID,
  DEFAULT_PALETTE,
  NEW_PALETTE_ENTRY_COLOUR_CANDIDATES,
  SCORE_ENTRY_ID,
} from '../../utils/palette/palette.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  PaletteEntriesReordered,
  PaletteEntrySaved,
  PaletteExportRequested,
  PaletteResetRequested,
  selectPaletteEntries,
} from '../../utils/states/palette.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { getDispatchedActionCalls } from '../../utils/test.support/get.dispatched.action.calls';

const NAME_LABEL = 'Name';
const MAX_POWER_LABEL = 'Max power (%)';
const SAVE_LABEL = 'Save';
const NEW_COLOUR_LABEL = '+ New colour';
const RESET_LABEL = 'Reset to defaults';
const RESET_CONFIRM_LABEL = 'Yes, reset';
const RESET_CONFIRM_TEXT = 'Replace the whole palette with the default colours? Your changes to the palette are lost.';
const EXPORT_LABEL = 'Export for Inkscape';
const DELETE_CONFIRM_LABEL = 'Yes, delete';
const LIST_LABEL = 'Palette colours';
const DIALOG_TITLE = 'Palette';
const LINUX_PATH_TEXT = 'Linux: ~/.config/inkscape/palettes/';
const WINDOWS_PATH_TEXT = 'Windows: %APPDATA%\\inkscape\\palettes\\';
const SHADING_NOTE_TEXT = 'The shading colour is fixed: it covers every grey from black to white.';
const POWER_ERROR_TEXT = 'Maximum power must be from 0 to 100 %';
const DUPLICATE_ERROR_TEXT = 'This colour is already in the palette';
const NAME_ERROR_TEXT = 'Enter a name for the colour';
const NEW_ENTRY_NAME = 'Etch';
const INVALID_POWER = 150;
const EDITED_POWER = 40;
const COLOUR_PICKER_DISABLED_SELECTOR = '.ant-color-picker-trigger-disabled';
const COLOUR_PICKER_SELECTOR = '.ant-color-picker-trigger';
const CUT_NAME_PATTERN = /^Cut/;
const SHADING_NAME_PATTERN = /^Shading/;
const SCORE_NAME_PATTERN = /^Score/;
const DRAG_DATA_TYPE = 'text/plain';
const NEW_ENTRY_COLOUR = '#12ab34';
const FIRST_CANDIDATE_COLOUR: string = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES[0] ?? '';
const SECOND_CANDIDATE_COLOUR: string = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES[1] ?? '';
const CUT_COLOUR = '#ff0000';
const CUSTOM_ENTRY_NAME = 'Custom etch';
const CUSTOM_NAME_PATTERN = /^Custom etch/;
const COLOUR_HEX_INPUT_SELECTOR = '.ant-color-picker-hex-input input';

const renderDialog = (store: AppStore, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <PaletteDialog isOpen onClose={onClose} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const clickButton = (label: string): void => {
  fireEvent.click(screen.getByRole('button', { name: label }));
};

const changeField = (label: string, value: string | number): void => {
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
};

const changeColour = (colour: string): void => {
  fireEvent.click(document.querySelector(COLOUR_PICKER_SELECTOR) ?? document.body);
  fireEvent.change(document.querySelector(COLOUR_HEX_INPUT_SELECTOR) ?? document.body, {
    target: { value: colour.slice(1) },
  });
};

const getEntryIds = (store: AppStore): string[] =>
  selectPaletteEntries(store.getState()).map((entry: PaletteEntry): string => entry.id);

const getRow = (name: RegExp): HTMLElement => {
  const row: HTMLElement | null = screen.getByRole('button', { name }).closest('li');

  if (!row) {
    throw new Error('The palette entry button is not inside a list row');
  }

  return row;
};

describe(PaletteDialog.name, () => {
  it('registers an overlay while it is open', () => {
    const store: AppStore = newStore();

    renderDialog(store);

    expect(screen.getByText(DIALOG_TITLE)).toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });

  it('lists the palette entries with the Inkscape folder hint', () => {
    renderDialog(newStore());

    const paletteList: HTMLElement = screen.getByRole('list', { name: LIST_LABEL });

    expect(within(paletteList).getAllByRole('listitem')).toHaveLength(DEFAULT_PALETTE.entries.length);
    expect(screen.getByText(LINUX_PATH_TEXT)).toBeInTheDocument();
    expect(screen.getByText(WINDOWS_PATH_TEXT)).toBeInTheDocument();
  });

  it('adds a new entry only when it is saved', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    clickButton(NEW_COLOUR_LABEL);
    changeField(NAME_LABEL, NEW_ENTRY_NAME);
    changeColour(NEW_ENTRY_COLOUR);

    expect(getEntryIds(store)).toHaveLength(DEFAULT_PALETTE.entries.length);

    clickButton(SAVE_LABEL);

    expect(selectPaletteEntries(store.getState()).at(-1)).toMatchObject({
      name: NEW_ENTRY_NAME,
      colour: NEW_ENTRY_COLOUR,
    });
    expect(getEntryIds(store)).toHaveLength(DEFAULT_PALETTE.entries.length + 1);
  });

  it('saves a new entry at once, because it starts with an unused colour', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    clickButton(NEW_COLOUR_LABEL);
    clickButton(SAVE_LABEL);

    expect(screen.queryByText(DUPLICATE_ERROR_TEXT)).not.toBeInTheDocument();
    expect(getEntryIds(store)).toHaveLength(DEFAULT_PALETTE.entries.length + 1);
  });

  it('starts a new entry with the next candidate colour when the first is taken', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new PaletteEntrySaved({ entry: newPaletteEntry({ colour: FIRST_CANDIDATE_COLOUR }) }));
    });
    renderDialog(store);
    clickButton(NEW_COLOUR_LABEL);
    clickButton(SAVE_LABEL);

    expect(selectPaletteEntries(store.getState()).at(-1)?.colour).toBe(SECOND_CANDIDATE_COLOUR);
  });

  it('blocks Save when an entry is given the colour of another entry', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    clickButton(NEW_COLOUR_LABEL);
    changeColour(CUT_COLOUR);
    clickButton(SAVE_LABEL);

    expect(screen.getByText(DUPLICATE_ERROR_TEXT)).toBeInTheDocument();
    expect(getDispatchedActionCalls(dispatchSpy, PaletteEntrySaved)).toEqual([]);
  });

  it('shows a default entry after Reset and does not bring a custom entry back on Save', () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new PaletteEntrySaved({
        entry: newPaletteEntry({ name: CUSTOM_ENTRY_NAME, colour: NEW_ENTRY_COLOUR }),
      }));
    });
    renderDialog(store);
    fireEvent.click(screen.getByRole('button', { name: CUSTOM_NAME_PATTERN }));
    clickButton(RESET_LABEL);
    clickButton(RESET_CONFIRM_LABEL);

    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('Cut');

    clickButton(SAVE_LABEL);

    expect(selectPaletteEntries(store.getState())).toEqual(DEFAULT_PALETTE.entries);
  });

  it('keeps a new unsaved entry in the form while the palette is unchanged', () => {
    renderDialog(newStore());
    clickButton(NEW_COLOUR_LABEL);

    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('New colour');
  });

  it('saves an edited entry in place', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    changeField(NAME_LABEL, NEW_ENTRY_NAME);
    changeField(MAX_POWER_LABEL, EDITED_POWER);
    clickButton(SAVE_LABEL);

    const savedCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, PaletteEntrySaved);

    expect(savedCalls).toHaveLength(1);
    expect(savedCalls[0]?.[0]).toMatchObject({
      payload: { entry: { id: CUT_ENTRY_ID, name: NEW_ENTRY_NAME, maxPowerPercent: EDITED_POWER } },
    });
    expect(getEntryIds(store)).toHaveLength(DEFAULT_PALETTE.entries.length);
  });

  it('blocks Save for an invalid power and shows the localized error', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    changeField(MAX_POWER_LABEL, INVALID_POWER);
    clickButton(SAVE_LABEL);

    expect(screen.getByText(POWER_ERROR_TEXT)).toBeInTheDocument();
    expect(getDispatchedActionCalls(dispatchSpy, PaletteEntrySaved)).toEqual([]);
  });

  it('blocks Save for an empty name', () => {
    renderDialog(newStore());
    changeField(NAME_LABEL, '');
    clickButton(SAVE_LABEL);

    expect(screen.getByText(NAME_ERROR_TEXT)).toBeInTheDocument();
  });

  it('discards unsaved edits when another entry is selected', () => {
    renderDialog(newStore());
    changeField(NAME_LABEL, NEW_ENTRY_NAME);
    fireEvent.click(screen.getByRole('button', { name: SCORE_NAME_PATTERN }));

    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('Score');
  });

  it('gives the shading entry no delete button and a locked colour', () => {
    renderDialog(newStore());

    expect(within(getRow(SHADING_NAME_PATTERN)).queryByRole('button', { name: /^Delete/ })).not.toBeInTheDocument();
    expect(within(getRow(CUT_NAME_PATTERN)).getByRole('button', { name: /^Delete/ })).toBeInTheDocument();
    expect(document.querySelector(COLOUR_PICKER_DISABLED_SELECTOR)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: SHADING_NAME_PATTERN }));

    expect(document.querySelector(COLOUR_PICKER_DISABLED_SELECTOR)).toBeInTheDocument();
    expect(screen.getByText(SHADING_NOTE_TEXT)).toBeInTheDocument();
  });

  it('shows an unlocked colour picker for an ordinary entry', () => {
    renderDialog(newStore());

    expect(document.querySelector(COLOUR_PICKER_SELECTOR)).toBeInTheDocument();
  });

  it('deletes an entry after the confirmation', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    fireEvent.click(within(getRow(SCORE_NAME_PATTERN)).getByRole('button', { name: /^Delete/ }));

    expect(getEntryIds(store)).toContain(SCORE_ENTRY_ID);

    clickButton(DELETE_CONFIRM_LABEL);

    expect(getEntryIds(store)).not.toContain(SCORE_ENTRY_ID);
  });

  it('moves an entry down with its move button', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderDialog(store);
    fireEvent.click(within(getRow(CUT_NAME_PATTERN)).getByRole('button', { name: /^Move Cut down/ }));

    const reorderCalls: unknown[][] = getDispatchedActionCalls(dispatchSpy, PaletteEntriesReordered);

    expect(reorderCalls).toHaveLength(1);
    expect(getEntryIds(store).slice(0, 2)).toEqual([SCORE_ENTRY_ID, CUT_ENTRY_ID]);
  });

  it('reorders by dragging a row onto another row', () => {
    const store: AppStore = newStore();
    const dataTransfer: Pick<DataTransfer, 'setData' | 'effectAllowed'> = { setData: vi.fn(), effectAllowed: 'none' };

    renderDialog(store);
    fireEvent.dragStart(getRow(CUT_NAME_PATTERN), { dataTransfer });
    fireEvent.drop(getRow(SCORE_NAME_PATTERN));

    expect(dataTransfer.setData).toHaveBeenCalledWith(DRAG_DATA_TYPE, CUT_ENTRY_ID);
    expect(getEntryIds(store).slice(0, 2)).toEqual([SCORE_ENTRY_ID, CUT_ENTRY_ID]);
  });

  it('forgets a cancelled drag, so a later drop moves nothing', () => {
    const store: AppStore = newStore();
    const dataTransfer: Pick<DataTransfer, 'setData' | 'effectAllowed'> = { setData: vi.fn(), effectAllowed: 'none' };

    renderDialog(store);
    fireEvent.dragStart(getRow(CUT_NAME_PATTERN), { dataTransfer });
    fireEvent.dragEnd(getRow(CUT_NAME_PATTERN));
    fireEvent.drop(getRow(SCORE_NAME_PATTERN));

    expect(getEntryIds(store).slice(0, 2)).toEqual([CUT_ENTRY_ID, SCORE_ENTRY_ID]);
  });

  it('dispatches the export request', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    dispatchSpy.mockImplementation((action) => action);
    renderDialog(store);
    clickButton(EXPORT_LABEL);

    expect(getDispatchedActionCalls(dispatchSpy, PaletteExportRequested)).toHaveLength(1);
  });

  it('asks before resetting the palette', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    act(() => {
      store.dispatch(new PaletteEntrySaved({ entry: newPaletteEntry({ colour: NEW_ENTRY_COLOUR }) }));
    });
    dispatchSpy.mockClear();
    renderDialog(store);
    clickButton(RESET_LABEL);

    expect(screen.getByText(RESET_CONFIRM_TEXT)).toBeInTheDocument();
    expect(getDispatchedActionCalls(dispatchSpy, PaletteResetRequested)).toEqual([]);

    clickButton(RESET_CONFIRM_LABEL);

    expect(getDispatchedActionCalls(dispatchSpy, PaletteResetRequested)).toHaveLength(1);
    expect(selectPaletteEntries(store.getState())).toEqual(DEFAULT_PALETTE.entries);
  });
});
