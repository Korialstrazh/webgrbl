import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedPanel } from '.';
import { GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import { getResolvedGrblPositions } from '../../utils/grbl/grbl.position.resolver';
import type { GrblAxisPosition } from '../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblStatusReport } from '../../utils/grbl/interfaces/GrblStatusReport';
import type { GrblResolvedPositions } from '../../utils/grbl/interfaces/GrblResolvedPositions';
import { DEFAULT } from '../../utils/localization/default.locales';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastShown } from '../../utils/states/toast.state';
import { BED_HEAD_TEST_ID } from '../../views/BedView/bed.view.constants';

const NOT_RESPONDING_TEXT = 'The controller is not responding.';
const NO_MACHINE_TEXT = 'Connect a machine to see its bed';
const WORK_POSITION: GrblAxisPosition = { x: 10, y: 20, z: 0 };
const WORK_COORDINATE_OFFSET: GrblAxisPosition = { x: 100, y: 30, z: 0 };
const EXPECTED_HEAD_TRANSFORM = 'translate(110 350)';
const VIEW_MODE_LABEL = 'Bed view';
const DESIGN_VIEW_LABEL = 'Design';

const renderPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <BedPanel hostRef={null} />
    </Provider>,
  );
};

const newPositionOnlyReport = (): GrblStatusReport => ({
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: WORK_POSITION,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
});

describe(BedPanel.name, () => {
  it('shows toasts inside the bed region', () => {
    const store: AppStore = newStore();

    renderPanel(store);
    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_NOT_RESPONDING,
        messageParameters: NO_TOAST_PARAMETERS,
      }));
    });

    expect(within(screen.getByRole('main')).getByText(NOT_RESPONDING_TEXT)).toBeInTheDocument();
  });

  it('asks for a machine while disconnected', () => {
    renderPanel(newStore());

    expect(screen.getByText(NO_MACHINE_TEXT)).toBeInTheDocument();
  });

  it('status with only WPos and a cached WCO still places the crosshair', () => {
    const store: AppStore = newStore();
    const positions: GrblResolvedPositions = getResolvedGrblPositions(newPositionOnlyReport(), WORK_COORDINATE_OFFSET);

    renderPanel(store);
    act(() => {
      store.dispatch(new MachineStatusReceived({ status: { ...newPositionOnlyReport(), ...positions } }));
    });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('transform', EXPECTED_HEAD_TRANSFORM);
  });

  it('names the view mode selector and shows Design as selected', () => {
    renderPanel(newStore());

    expect(screen.getByRole('radiogroup', { name: VIEW_MODE_LABEL, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL, hidden: true })).toBeChecked();
  });

  it('dispatches nothing from the toolbar controls', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    fireEvent.click(screen.getByRole('button', { name: 'Select', hidden: true }));
    fireEvent.click(screen.getByRole('radio', { name: 'Toolpath', hidden: true }));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
