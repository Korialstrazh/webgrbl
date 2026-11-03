import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DesignPanel } from '.';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
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
  it('shows the material, layers and objects panels in that order in the Design view', () => {
    renderDesignPanel(newStore());

    expect(getHeadingNames()).toEqual([MATERIAL_TITLE, LAYERS_TITLE, OBJECTS_TITLE]);
    expect(screen.getByRole('combobox', { name: MATERIAL_TITLE })).toBeInTheDocument();
    expect(document.querySelectorAll(DISABLED_REGION_SELECTOR)).toHaveLength(0);
  });

  it('shows the objects section with an import button as an active control', () => {
    renderDesignPanel(newStore());

    expect(screen.getByRole('button', { name: IMPORT_SVG_LABEL })).toBeEnabled();
    expect(screen.getByRole('button', { name: IMPORT_SVG_LABEL }).closest(DISABLED_REGION_SELECTOR)).toBeNull();
  });

  it('leaves the Cut check out of the Design view', () => {
    renderDesignPanel(newStore());

    expect(screen.queryByRole('heading', { name: CUT_CHECK_TITLE })).not.toBeInTheDocument();
  });

  it('in 3D shows the Cut check above Layers and hides Objects', () => {
    const store: AppStore = newStore();

    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    renderDesignPanel(store);

    expect(getHeadingNames()).toEqual([CUT_CHECK_TITLE, LAYERS_TITLE]);
  });

  it('puts Add test sample in the Layers panel', () => {
    renderDesignPanel(newStore());

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
