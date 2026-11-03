import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DesignPanel } from '.';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const DISABLED_REGION_SELECTOR = '[aria-disabled="true"]';
const PANEL_TITLES: readonly string[] = ['Layers', 'Objects'];
const PLANNED_PANEL_TITLE = 'Material';
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

describe(DesignPanel.name, () => {
  it('shows the layers and objects panels and no placeholder panel for the planned material', () => {
    renderDesignPanel(newStore());

    for (const panelTitle of PANEL_TITLES) {
      expect(screen.getByRole('heading', { name: panelTitle })).toBeInTheDocument();
    }

    expect(screen.queryByRole('heading', { name: PLANNED_PANEL_TITLE })).not.toBeInTheDocument();
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

    const headingNames: (string | null)[] = screen.getAllByRole('heading').map(
      (heading: HTMLElement) => heading.textContent,
    );

    expect(headingNames).toEqual([CUT_CHECK_TITLE, PANEL_TITLES[0]]);
  });

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
