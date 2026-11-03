import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { TestSampleDialog } from '.';
import { DEFAULT_CUT_ENTRY } from '../../utils/palette/palette.constants';
import type { Material } from '../../utils/materials/interfaces/Material';
import { MATERIAL_TEST_OUTCOME } from '../../utils/materials/material.constants';
import { MATERIAL_REPOSITORY } from '../../utils/materials/material.repository';
import { newMaterial } from '../../utils/materials/new.material';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { SampleGcodeExportRequested } from '../../utils/states/toolpath.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { getDispatchedActionCalls } from '../../utils/test.support/get.dispatched.action.calls';
import type { MockInstance } from 'vitest';

const POWER_LABEL = 'Power (%)';
const SPEED_LABEL = 'Speed (mm/min)';
const PASSES_LABEL = 'Passes';
const EXPORT_LABEL = 'Export sample G-code';
const CUT_THROUGH_LABEL = 'Cut through';
const NOT_THROUGH_LABEL = 'Not through';
const DEPTH_LABEL = 'Depth (mm)';
const SAVE_LABEL = 'Save for this material';
const CANCEL_LABEL = 'Cancel';
const DEPTH_ERROR = 'Enter a depth above 0 and at most 3 mm.';
const NO_PROFILE_REASON = 'Choose a machine profile to export the sample.';
const TOO_SMALL_REASON = 'The sample does not fit the work area of this machine.';
const MATERIAL: Material = newMaterial({ name: 'Plywood 3 mm', thicknessMm: 3 });
const ENTERED_POWER_PERCENT = 55;
const ENTERED_SPEED_MM_PER_MIN = 420;
const ENTERED_PASSES = 2;
const ENTERED_DEPTH_MM = 2;
const SMALL_AREA_MM = 40;

const newTestStore = (profile: MachineProfile | null = newMachineProfile()): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new MaterialSaved({ material: MATERIAL }));

  if (profile) {
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  }

  return store;
};

const renderDialog = (store: AppStore, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <TestSampleDialog isOpen material={MATERIAL} onClose={onClose} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const enterNumber = (label: string, value: number | string): void => {
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
};

const clickButton = (name: string): void => {
  fireEvent.click(screen.getByRole('button', { name }));
};

const getSavedResults = (store: AppStore): Material['testResults'] =>
  selectMaterials(store.getState())[0]?.testResults ?? [];

describe(TestSampleDialog.name, () => {
  it('registers an overlay and starts from the settings of the first Line layer', () => {
    const store: AppStore = newTestStore();

    renderDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByLabelText(POWER_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.maxPowerPercent));
    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.speedMmPerMin));
    expect(screen.getByLabelText(PASSES_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.passes));
  });

  it('requests the export with the entered settings', () => {
    const store: AppStore = newTestStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch').mockImplementation(
      (action: unknown) => action as never,
    );

    renderDialog(store);
    enterNumber(POWER_LABEL, ENTERED_POWER_PERCENT);
    enterNumber(SPEED_LABEL, ENTERED_SPEED_MM_PER_MIN);
    enterNumber(PASSES_LABEL, ENTERED_PASSES);
    clickButton(EXPORT_LABEL);

    const [exportCall] = getDispatchedActionCalls(dispatchSpy, SampleGcodeExportRequested);

    expect((exportCall?.[0] as SampleGcodeExportRequested).payload.cutSettings).toEqual({
      powerPercent: ENTERED_POWER_PERCENT,
      speedMmPerMin: ENTERED_SPEED_MM_PER_MIN,
      passes: ENTERED_PASSES,
    });
  });

  it('disables the export and says why when there is no active profile', () => {
    renderDialog(newTestStore(null));

    expect(screen.getByRole('button', { name: EXPORT_LABEL })).toBeDisabled();
    expect(screen.getByText(NO_PROFILE_REASON)).toBeInTheDocument();
  });

  it('disables the export and says why when the sample does not fit', () => {
    renderDialog(newTestStore(newMachineProfile({ workAreaXMm: SMALL_AREA_MM, workAreaYMm: SMALL_AREA_MM })));

    expect(screen.getByRole('button', { name: EXPORT_LABEL })).toBeDisabled();
    expect(screen.getByText(TOO_SMALL_REASON)).toBeInTheDocument();
  });

  it('saves Cut through without a depth, for the active profile, and closes', () => {
    const profile: MachineProfile = newMachineProfile();
    const store: AppStore = newTestStore(profile);
    const onClose = vi.fn();

    renderDialog(store, onClose);
    clickButton(CUT_THROUGH_LABEL);
    clickButton(SAVE_LABEL);

    expect(getSavedResults(store)).toEqual([expect.objectContaining({
      machineProfileId: profile.id,
      outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
      depthMm: undefined,
      thicknessMm: MATERIAL.thicknessMm,
      passes: DEFAULT_CUT_ENTRY.passes,
    })]);
    expect(Number.isNaN(Date.parse(getSavedResults(store)[0]?.testedAtIso ?? ''))).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves Not through with the entered depth', () => {
    const store: AppStore = newTestStore();

    renderDialog(store);
    clickButton(NOT_THROUGH_LABEL);
    enterNumber(DEPTH_LABEL, ENTERED_DEPTH_MM);
    clickButton(SAVE_LABEL);

    expect(getSavedResults(store)[0]).toMatchObject({
      outcome: MATERIAL_TEST_OUTCOME.NOT_THROUGH,
      depthMm: ENTERED_DEPTH_MM,
    });
  });

  it.each(['0', '3.5'])('blocks Save with a localized error for the depth "%s"', (depthText: string) => {
    const store: AppStore = newTestStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    clickButton(NOT_THROUGH_LABEL);
    enterNumber(DEPTH_LABEL, depthText);
    clickButton(SAVE_LABEL);

    expect(screen.getByText(DEPTH_ERROR)).toBeInTheDocument();
    expect(getSavedResults(store)).toEqual([]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps the result of the active profile only, and reloads it through a second store', async () => {
    const profile: MachineProfile = newMachineProfile();
    const store: AppStore = newTestStore(profile);

    renderDialog(store);
    clickButton(SAVE_LABEL);
    await vi.waitFor(async (): Promise<void> => {
      expect((await MATERIAL_REPOSITORY.listMaterials())[0]?.testResults).toHaveLength(1);
    });

    const secondStore: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectMaterials(secondStore.getState())[0]?.testResults.map((result) => result.machineProfileId))
        .toEqual([profile.id]);
    });
  });

  it('saves nothing on Cancel', () => {
    const store: AppStore = newTestStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    clickButton(CANCEL_LABEL);

    expect(getSavedResults(store)).toEqual([]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
