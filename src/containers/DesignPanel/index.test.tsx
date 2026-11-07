import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DesignPanel } from '.';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { newProjectObject } from '../../utils/project/new.project.object';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
import { ProjectObjectsAdded } from '../../utils/states/project.document.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const DISABLED_REGION_SELECTOR = '[aria-disabled="true"]';
const MATERIAL_TITLE = 'Material';
const LAYERS_TITLE = 'Layers';
const OBJECTS_TITLE = 'Objects';
const ADD_TEST_SAMPLE_LABEL = 'Add test sample';
const CUT_CHECK_TITLE = 'Cut check';
const IMPORT_SVG_LABEL = 'Import SVG';
const PALETTE_BUTTON_LABEL = 'Palette';
const PALETTE_LIST_LABEL = 'Palette colours';
const CUT_CHECK_NOTE = 'The cut check runs in the 3D view.';
const OBJECTS_NOTE = 'Objects are edited in the Design and Toolpath views.';
const MATERIAL_NOTE = 'The material is chosen in the Design view.';

const renderDesignPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <DesignPanel />
    </Provider>,
  );
};

const getHeadingNames = (): (string | null)[] => screen.getAllByRole('heading').map(
  (heading: HTMLElement) => heading.textContent,
);

describe(DesignPanel.name, () => {
  it.each([BED_VIEW_MODE.DESIGN, BED_VIEW_MODE.TOOLPATH, BED_VIEW_MODE.THREE_D])(
    'keeps layers, material, objects and the Cut check in that order in the %s view',
    (viewMode: BedViewMode) => {
      const store: AppStore = newStore();

      store.dispatch(new BedViewModeChanged({ viewMode }));
      renderDesignPanel(store);

      expect(getHeadingNames()).toEqual([LAYERS_TITLE, MATERIAL_TITLE, OBJECTS_TITLE, CUT_CHECK_TITLE]);
    },
  );

  it('shows the material select and a muted Cut check note in the Design view', () => {
    renderDesignPanel(newStore());

    expect(screen.getByRole('note', { name: CUT_CHECK_NOTE })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: MATERIAL_TITLE })).toBeInTheDocument();
    expect(document.querySelectorAll(DISABLED_REGION_SELECTOR)).toHaveLength(0);
  });

  it('leaves the SVG import to the top bar and the card on the bed', () => {
    renderDesignPanel(newStore());

    expect(screen.queryByRole('button', { name: IMPORT_SVG_LABEL })).not.toBeInTheDocument();
  });

  it('in 3D collapses Objects and Material to muted notes', () => {
    const store: AppStore = newStore();

    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    renderDesignPanel(store);

    expect(screen.getByRole('note', { name: OBJECTS_NOTE })).toBeInTheDocument();
    expect(screen.getByRole('note', { name: MATERIAL_NOTE })).toBeInTheDocument();
    expect(screen.queryByRole('note', { name: CUT_CHECK_NOTE })).not.toBeInTheDocument();
  });

  it('leaves Add test sample to the bed card while the bed is empty', () => {
    renderDesignPanel(newStore());

    expect(screen.queryByRole('button', { name: ADD_TEST_SAMPLE_LABEL })).not.toBeInTheDocument();
  });

  it('puts Add test sample in the Layers panel once the bed has objects', () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    renderDesignPanel(store);

    const layersPanel: HTMLElement = screen.getByRole('region', { name: LAYERS_TITLE });

    expect(within(layersPanel).getByRole('button', { name: ADD_TEST_SAMPLE_LABEL })).toBeInTheDocument();
  });

  it.each([BED_VIEW_MODE.TOOLPATH, BED_VIEW_MODE.THREE_D])(
    'leaves the material select and Add test sample out of the %s view',
    (viewMode: BedViewMode) => {
      const store: AppStore = newStore();

      store.dispatch(new BedViewModeChanged({ viewMode }));
      renderDesignPanel(store);

      expect(screen.queryByRole('combobox', { name: MATERIAL_TITLE })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: ADD_TEST_SAMPLE_LABEL })).not.toBeInTheDocument();
    },
  );

  it('opens the palette dialog from the Palette button in the Layers header', () => {
    const store: AppStore = newStore();

    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <DesignPanel />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.queryByRole('list', { name: PALETTE_LIST_LABEL })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: PALETTE_BUTTON_LABEL }));

    expect(screen.getByRole('list', { name: PALETTE_LIST_LABEL })).toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });
});
