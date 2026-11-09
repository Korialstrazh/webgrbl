import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { LayersSection } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { HORIZONTAL_ELLIPSIS, MIDDLE_DOT, MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getObjectsDerivedLayers } from '../../utils/layers/get.objects.derived.layers';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY, DEFAULT_FILL_ENTRY, DEFAULT_PALETTE } from '../../utils/palette/palette.constants';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  LayerToggled,
  LayersReordered,
  ProjectDocumentLoaded,
  ProjectObjectsAdded,
  selectProjectLayers,
} from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const CUT_COLOUR = DEFAULT_CUT_ENTRY.colour;
const FILL_COLOUR = DEFAULT_FILL_ENTRY.colour;
const UNKNOWN_COLOUR = '#123456';
const DANGLING_ENTRY_ID = 'removed-entry';
const CUT_SUMMARY = `Line ${MIDDLE_DOT} 100 % ${MIDDLE_DOT} 300 mm/min ${MIDDLE_DOT} 3${MULTIPLICATION_SIGN}`;
const FILL_SUMMARY = `Fill ${MIDDLE_DOT} 50 % ${MIDDLE_DOT} 2000 mm/min ${MIDDLE_DOT} 1${MULTIPLICATION_SIGN}`;
const NOT_IN_PALETTE_NOTE = 'Not in the palette yet: open the layer to save its colour';
const UNKNOWN_COLOUR_NAME = 'Black';
const CUT_COLOUR_NAME = 'Red';
const LAYERS_LIST_NAME = 'Project layers';
const EMPTY_HINT_PATTERN = /No layers yet/;
const SEND_CUT_LABEL = 'Send Cut to the laser';
const SEND_UNKNOWN_LABEL = `Send ${UNKNOWN_COLOUR_NAME} to the laser`;
const MOVE_CUT_DOWN_LABEL = 'Move Cut down';
const MOVE_CUT_UP_LABEL = 'Move Cut up';
const MOVE_FILL_UP_LABEL = 'Move Fill up';
const CUT_BUTTON_PATTERN = /^Cut/;
const DRAWER_OVERLINE = 'Layer settings';
const CLOSE_LABEL = 'Close';
const OPEN_ROW_CLASS_NAME = 'openRow';
const ROW_ROLE_SELECTOR = 'li';
const FILL_BUTTON_PATTERN = /^Fill/;
const EDIT_PALETTE_LABEL = `Edit palette${HORIZONTAL_ELLIPSIS}`;
const FILL_ROW_INDEX = 0;
const CUT_ROW_INDEX = 1;
const ROW_ROLE = 'listitem';
const DRAG_TRANSFER = { setData: vi.fn(), effectAllowed: '' };

const newColouredObject = (colour: string): ProjectObject => newProjectObject({
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${colour}" width="5" height="5"/></svg>`,
});

const loadColours = (store: AppStore, colours: string[]): void => {
  const objects: ProjectObject[] = colours.map(newColouredObject);

  act(() => {
    store.dispatch(new ProjectObjectsAdded({
      objects,
      layers: getObjectsDerivedLayers(objects, DEFAULT_PALETTE, []),
    }));
  });
};

const renderSection = (store: AppStore, onEditPalette: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <LayersSection onEditPalette={onEditPalette} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const getLayerKeys = (store: AppStore): string[] => selectProjectLayers(store.getState()).map(getLayerKey);

const getVisibleLayer = (store: AppStore, layerKey: string): ProjectLayer => {
  const layer: ProjectLayer | undefined = selectProjectLayers(store.getState()).find(
    (candidate: ProjectLayer): boolean => getLayerKey(candidate) === layerKey,
  );

  if (!layer) {
    throw new Error(`No layer ${layerKey}`);
  }

  return layer;
};

const getRow = (rowIndex: number): HTMLElement => {
  const row: HTMLElement | undefined = screen.getAllByRole(ROW_ROLE)[rowIndex];

  if (!row) {
    throw new Error(`No row ${rowIndex}`);
  }

  return row;
};

const getRowTexts = (): string[] =>
  within(screen.getByRole('list', { name: LAYERS_LIST_NAME }))
    .getAllByRole(ROW_ROLE)
    // The summary is icons and values; a text for screen readers in the row holds the whole line.
    .map((row: HTMLElement): string => row.textContent);

describe(LayersSection.name, () => {
  it('shows a hint while the design has no layers', () => {
    renderSection(newStore());

    expect(screen.getByText(EMPTY_HINT_PATTERN)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists the layers with their summaries; an unknown colour gets a colour name and an info icon, unchecked', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR, UNKNOWN_COLOUR]);
    renderSection(store);

    const [fillRowText, cutRowText, unknownRowText]: string[] = getRowTexts();

    expect(fillRowText).toContain(FILL_SUMMARY);
    expect(cutRowText).toContain(CUT_SUMMARY);
    expect(unknownRowText).toContain(UNKNOWN_COLOUR_NAME);
    expect(unknownRowText).not.toContain(UNKNOWN_COLOUR);
    expect(screen.getAllByLabelText(NOT_IN_PALETTE_NOTE)).toHaveLength(1);
    expect(screen.getByRole('checkbox', { name: SEND_CUT_LABEL })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: SEND_UNKNOWN_LABEL })).not.toBeChecked();
  });

  it('names its role above the rows, so it reads apart from the palette', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderSection(store);

    expect(screen.getByText('Burn order')).toBeInTheDocument();
  });

  it('shows the note for a palette id the palette no longer has', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    const cutLayer: ProjectLayer = getVisibleLayer(store, CUT_COLOUR);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: {
          objects: [newColouredObject(CUT_COLOUR)],
          layers: [{ ...cutLayer, paletteEntryId: DANGLING_ENTRY_ID }],
        },
      }));
    });
    renderSection(store);

    expect(screen.getByLabelText(NOT_IN_PALETTE_NOTE)).toBeInTheDocument();
    expect(screen.getByText(CUT_COLOUR_NAME)).toBeInTheDocument();
  });

  it('dispatches LayerToggled false when a layer is unchecked', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderSection(store);

    fireEvent.click(screen.getByRole('checkbox', { name: SEND_CUT_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new LayerToggled({ layerKey: CUT_COLOUR, enabled: false }));
  });

  it('dispatches the full new order when a row is dragged onto another', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderSection(store);

    expect(getLayerKeys(store)).toEqual([FILL_COLOUR, CUT_COLOUR]);

    fireEvent.dragStart(getRow(CUT_ROW_INDEX), { dataTransfer: DRAG_TRANSFER });
    fireEvent.dragOver(getRow(FILL_ROW_INDEX));
    fireEvent.drop(getRow(FILL_ROW_INDEX));

    expect(dispatchSpy).toHaveBeenCalledWith(new LayersReordered({ layerKeys: [CUT_COLOUR, FILL_COLOUR] }));
    expect(getLayerKeys(store)).toEqual([CUT_COLOUR, FILL_COLOUR]);
  });

  it('ignores a drop after the drag ended without a drop', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderSection(store);

    fireEvent.dragStart(getRow(CUT_ROW_INDEX), { dataTransfer: DRAG_TRANSFER });
    fireEvent.dragEnd(getRow(CUT_ROW_INDEX));
    fireEvent.drop(getRow(FILL_ROW_INDEX));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('ignores a drop that no row drag started', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderSection(store);

    fireEvent.drop(getRow(FILL_ROW_INDEX));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('reorders with the move buttons, and disables the ends', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    renderSection(store);

    expect(screen.getByRole('button', { name: MOVE_FILL_UP_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: MOVE_CUT_DOWN_LABEL })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: MOVE_CUT_UP_LABEL }));

    expect(getLayerKeys(store)).toEqual([CUT_COLOUR, FILL_COLOUR]);
    expect(getRowTexts()[FILL_ROW_INDEX]).toContain(CUT_SUMMARY);
  });

  it('opens the settings drawer for the clicked layer and closes it again', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderSection(store);

    expect(screen.queryByText(DRAWER_OVERLINE)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: CUT_BUTTON_PATTERN }));

    expect(screen.getByText(DRAWER_OVERLINE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText(DRAWER_OVERLINE)).not.toBeInTheDocument();
  });

  it.each([
    ['the close button', (): void => {
      fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
    }],
    ['Escape', (): void => {
      fireEvent.keyDown(screen.getByText(DRAWER_OVERLINE), { key: ESCAPE_KEY });
    }],
  ])('returns the focus to the layer row when the drawer closes with %s', async (
    _closeName: string,
    closeDrawer: () => void,
  ) => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    renderSection(store);
    const cutButton: HTMLElement = screen.getByRole('button', { name: CUT_BUTTON_PATTERN });

    fireEvent.click(cutButton);
    act(() => {
      screen.getByRole('button', { name: CLOSE_LABEL }).focus();
    });
    closeDrawer();

    await waitFor(() => {
      expect(cutButton).toHaveFocus();
    });
  });

  it('highlights the whole row of the layer the drawer shows, and only that row', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    renderSection(store);

    const cutButton: HTMLElement = screen.getByRole('button', { name: CUT_BUTTON_PATTERN });
    const fillButton: HTMLElement = screen.getByRole('button', { name: FILL_BUTTON_PATTERN });

    fireEvent.click(cutButton);

    expect(cutButton.closest(ROW_ROLE_SELECTOR)?.className).toContain(OPEN_ROW_CLASS_NAME);
    expect(fillButton.closest(ROW_ROLE_SELECTOR)?.className).not.toContain(OPEN_ROW_CLASS_NAME);
    expect(cutButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(cutButton.closest(ROW_ROLE_SELECTOR)?.className).not.toContain(OPEN_ROW_CLASS_NAME);
  });

  it('calls onEditPalette from the drawer', () => {
    const store: AppStore = newStore();
    const onEditPalette = vi.fn();
    loadColours(store, [CUT_COLOUR]);
    renderSection(store, onEditPalette);

    fireEvent.click(screen.getByRole('button', { name: CUT_BUTTON_PATTERN }));
    fireEvent.click(screen.getByRole('button', { name: EDIT_PALETTE_LABEL }));

    expect(onEditPalette).toHaveBeenCalledTimes(1);
  });
});
