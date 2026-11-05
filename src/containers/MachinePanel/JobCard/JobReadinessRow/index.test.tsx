import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobReadinessRow } from '.';
import { GRBL_CONNECTION_STATUS } from '../../../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../../../utils/states/grbl.connection.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';
import { selectIsConnectionPopoverOpen } from '../../../../utils/states/ui.overlay.state';
import { selectIsMachineProfilesDialogOpen, selectNarrowRegion } from '../../../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../../../utils/states/workbench.region.constants';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';

const PRIMARY_SELECTOR = '.ant-btn-primary';
const PROFILE_OPEN = 'Profile: to do';
const CONNECT_OPEN = 'Connect: to do';
const CONNECT_MET = 'Connect: done';
const MATERIAL_OPEN = 'Material: to do';

const renderRow = (): AppStore => {
  const store: AppStore = newStore();

  render(<Provider store={store}><AntdTestProvider><JobReadinessRow /></AntdTestProvider></Provider>);

  return store;
};

describe(JobReadinessRow.name, () => {
  it('makes only the first open step the accent action', () => {
    renderRow();

    const accentButtons: NodeListOf<Element> = document.querySelectorAll(PRIMARY_SELECTOR);

    expect(accentButtons).toHaveLength(1);
    expect(accentButtons[0]).toBe(screen.getByRole('button', { name: PROFILE_OPEN }));
  });

  it('ticks Connect live from the connection state', () => {
    const store: AppStore = renderRow();

    expect(screen.getByRole('button', { name: CONNECT_OPEN })).toBeInTheDocument();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });

    expect(screen.getByRole('button', { name: CONNECT_MET })).toBeInTheDocument();
  });

  it('goes to where each step is set', () => {
    const store: AppStore = renderRow();

    fireEvent.click(screen.getByRole('button', { name: PROFILE_OPEN }));
    fireEvent.click(screen.getByRole('button', { name: CONNECT_OPEN }));
    fireEvent.click(screen.getByRole('button', { name: MATERIAL_OPEN }));

    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
    expect(selectNarrowRegion(store.getState())).toBe(WORKBENCH_REGION.DESIGN);
  });
});
