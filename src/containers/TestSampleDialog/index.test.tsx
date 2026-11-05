import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { TestSampleDialog } from '.';
import { getSampleJobLayers } from '../../utils/materials/get.sample.job.layers';
import { getSampleJobObject } from '../../utils/materials/get.sample.job.object';
import type { Material } from '../../utils/materials/interfaces/Material';
import { MATERIAL_TEST_OUTCOME } from '../../utils/materials/material.constants';
import { MATERIAL_REPOSITORY } from '../../utils/materials/material.repository';
import { newMaterial } from '../../utils/materials/new.material';
import { SAMPLE_CUT_COLOUR } from '../../utils/materials/sample.job.constants';
import { DEFAULT_CUT_ENTRY, DEFAULT_PALETTE, DEFAULT_SCORE_ENTRY, PASSES_MAX, SPEED_MM_PER_MIN_MAX } from '../../utils/palette/palette.constants';
import { getNewLayer } from '../../utils/layers/get.new.layer';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { newToolpathMachineArea } from '../../utils/toolpath/test.support/new.toolpath.machine.area';

const POWER_LABEL = 'Power (%)';
const SPEED_LABEL = 'Speed (mm/min)';
const PASSES_LABEL = 'Passes';
const CUT_THROUGH_LABEL = 'Cut through';
const NOT_THROUGH_LABEL = 'Not through';
const DEPTH_LABEL = 'Depth (mm)';
const SAVE_LABEL = 'Save for this material';
const CANCEL_LABEL = 'Cancel';
const DEPTH_ERROR = 'Enter a depth above 0 and at most 3 mm.';
const NO_PROFILE_REASON = 'Choose a laser profile to save the result.';
const MATERIAL: Material = newMaterial({ name: 'Plywood 3 mm', thicknessMm: 3 });
const ENTERED_POWER_PERCENT = 55;
const ENTERED_SPEED_MM_PER_MIN = 420;
const ENTERED_PASSES = 2;
const ENTERED_DEPTH_MM = 2;
const OVER_POWER_PERCENT = 500;
const SAMPLE_LAYER_PASSES = 7;
const INVALID_SETTINGS_REASON = 'Enter power 1 to 100 %, speed 1 to 20000 mm/min and passes 1 to 50.';
const SETTINGS_HINT = 'These must match what was burnt.';

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
  it('holds the result only: no export, nothing chosen, and a line about matching what was burnt', () => {
    const store: AppStore = newTestStore();

    renderDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
    expect(screen.getByText(SETTINGS_HINT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: CUT_THROUGH_LABEL })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: NOT_THROUGH_LABEL })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();

    clickButton(NOT_THROUGH_LABEL);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeEnabled();
  });

  it('prefills from the default Cut without a Line layer', () => {
    renderDialog(newTestStore());

    expect(screen.getByLabelText(POWER_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.maxPowerPercent));
    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.speedMmPerMin));
    expect(screen.getByLabelText(PASSES_LABEL)).toHaveValue(String(DEFAULT_CUT_ENTRY.passes));
  });

  it("prefills from the sample's Line layer, not an earlier Line layer", () => {
    const store: AppStore = newTestStore();
    const scoreLayer: ProjectLayer = getNewLayer(DEFAULT_SCORE_ENTRY.colour, DEFAULT_PALETTE, 0);
    const scoreObject: ProjectObject = newProjectObject({
      svgText: `<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" fill="none" stroke="${DEFAULT_SCORE_ENTRY.colour}"/></svg>`,
    });
    const sampleObject: ProjectObject = getSampleJobObject(newToolpathMachineArea());
    const layers: ProjectLayer[] = getSampleJobLayers([scoreObject, sampleObject], DEFAULT_PALETTE, [scoreLayer]).map(
      (layer: ProjectLayer): ProjectLayer => (layer.colour === SAMPLE_CUT_COLOUR
        ? { ...layer, settings: { ...layer.settings, passes: SAMPLE_LAYER_PASSES } }
        : layer),
    );

    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [scoreObject, sampleObject], layers } }));
    renderDialog(store);

    expect(screen.getByLabelText(PASSES_LABEL)).toHaveValue(String(SAMPLE_LAYER_PASSES));
  });

  it('prefills from the first Line layer when no sample is in the project', () => {
    const store: AppStore = newTestStore();
    const scoreObject: ProjectObject = newProjectObject({
      svgText: `<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" fill="none" stroke="${DEFAULT_SCORE_ENTRY.colour}"/></svg>`,
    });
    const scoreLayer: ProjectLayer = getNewLayer(DEFAULT_SCORE_ENTRY.colour, DEFAULT_PALETTE, 0);

    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [scoreObject], layers: [scoreLayer] } }));
    renderDialog(store);

    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(String(DEFAULT_SCORE_ENTRY.speedMmPerMin));
  });

  it('keeps Save off and says why with no active profile', () => {
    renderDialog(newTestStore(null));
    clickButton(CUT_THROUGH_LABEL);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    expect(screen.getByText(NO_PROFILE_REASON)).toBeInTheDocument();
  });

  it('saves Cut through with the edited settings, the thickness and the profile, and closes', () => {
    const profile: MachineProfile = newMachineProfile();
    const store: AppStore = newTestStore(profile);
    const onClose = vi.fn();

    renderDialog(store, onClose);
    enterNumber(POWER_LABEL, ENTERED_POWER_PERCENT);
    enterNumber(SPEED_LABEL, ENTERED_SPEED_MM_PER_MIN);
    enterNumber(PASSES_LABEL, ENTERED_PASSES);
    clickButton(CUT_THROUGH_LABEL);
    clickButton(SAVE_LABEL);

    expect(getSavedResults(store)).toEqual([expect.objectContaining({
      machineProfileId: profile.id,
      outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
      depthMm: undefined,
      thicknessMm: MATERIAL.thicknessMm,
      powerPercent: ENTERED_POWER_PERCENT,
      speedMmPerMin: ENTERED_SPEED_MM_PER_MIN,
      passes: ENTERED_PASSES,
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
    clickButton(CUT_THROUGH_LABEL);
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

  it.each<[string, string, number]>([
    ['power', POWER_LABEL, OVER_POWER_PERCENT],
    ['speed', SPEED_LABEL, SPEED_MM_PER_MIN_MAX + 1],
    ['passes', PASSES_LABEL, PASSES_MAX + 1],
  ])('disables Save and says why for %s above the shared limit', (_name, label, value) => {
    renderDialog(newTestStore());
    clickButton(CUT_THROUGH_LABEL);
    enterNumber(label, value);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(INVALID_SETTINGS_REASON);
  });

  it('allows speed and passes at the shared limits', () => {
    renderDialog(newTestStore());
    clickButton(CUT_THROUGH_LABEL);
    enterNumber(SPEED_LABEL, SPEED_MM_PER_MIN_MAX);
    enterNumber(PASSES_LABEL, PASSES_MAX);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeEnabled();
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
