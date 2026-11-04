import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { MaterialLibraryDialog } from '.';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getMaterialPresetsFileText } from '../../utils/materials/get.material.presets.file.text';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../utils/materials/interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from '../../utils/materials/material.preset.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { newMaterialPreset } from '../../utils/materials/new.material.preset';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { getObjectsDerivedLayers } from '../../utils/layers/get.objects.derived.layers';
import { DEFAULT_PALETTE } from '../../utils/palette/palette.constants';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import {
  ActiveMachineProfileSelected,
  MachineProfileDeleted,
  MachineProfileSaved,
} from '../../utils/states/machine.profile.state';
import { MaterialPresetSaved, selectMaterialPresets } from '../../utils/states/material.preset.state';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectObjectsAdded, selectProjectLayers } from '../../utils/states/project.document.state';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import { selectToasts } from '../../utils/states/toast.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const APPLY_LABEL = 'Apply to layer';
const LAYER_COLOUR = '#ff0000';
const LAYER_OBJECT: ProjectObject = newProjectObject({
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${LAYER_COLOUR}" width="5" height="5"/></svg>`,
});
const IMPORT_FILE_NAME = 'presets.json';
const IMPORT_INPUT_LABEL = 'Open a material presets file';
const POWER_LABEL = 'Power (W)';
const SAVE_LABEL = 'Save';
const ADD_LABEL = 'Add preset';
const SEARCH_LABEL = 'Search material, thickness, operation';
const ONLY_MACHINE_LABEL = 'Only for this machine';
const NEW_POWER_WATTS = 4;
const TOO_MUCH_POWER_WATTS = 11;
const MAX_POWER_WATTS = 10;
const PLYWOOD_NAME = 'Plywood';
const ACRYLIC_NAME = 'Acrylic';

const PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: MAX_POWER_WATTS });
const OTHER_PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: MAX_POWER_WATTS });
const HALF_POWER_PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: MAX_POWER_WATTS / 2 });
const PLYWOOD: Material = newMaterial({ name: PLYWOOD_NAME });
const ACRYLIC: Material = newMaterial({ name: ACRYLIC_NAME });

const newPresetFixture = (material: Material, profile: MachineProfile): MaterialPreset => newMaterialPreset({
  materialId: material.id,
  machineProfileId: profile.id,
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: 300,
  passes: 1,
  notes: '',
});

const renderDialog = (presets: MaterialPreset[] = [], hasActiveProfile: boolean = true): AppStore => {
  const store: AppStore = newStore();

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
    store.dispatch(new MachineProfileSaved({ profile: OTHER_PROFILE }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));

    if (!hasActiveProfile) {
      store.dispatch(new MachineProfileDeleted({ profileId: PROFILE.id }));
    }

    store.dispatch(new MaterialSaved({ material: PLYWOOD }));
    store.dispatch(new MaterialSaved({ material: ACRYLIC }));
    presets.forEach((preset: MaterialPreset) => store.dispatch(new MaterialPresetSaved({ preset })));
  });
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialLibraryDialog isOpen onClose={() => undefined} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );

  return store;
};

const enterPower = (powerWatts: number): void => {
  fireEvent.change(screen.getByRole('spinbutton', { name: POWER_LABEL }), { target: { value: String(powerWatts) } });
};

describe(MaterialLibraryDialog.name, () => {
  it('saves a new preset for the active machine once a power is entered', async () => {
    const store: AppStore = renderDialog();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));

    const saveButton: HTMLElement = screen.getByRole('button', { name: SAVE_LABEL });

    expect(saveButton).toBeDisabled();
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(saveButton);

    expect(selectMaterialPresets(store.getState())).toEqual([
      expect.objectContaining({ machineProfileId: PROFILE.id, powerWatts: NEW_POWER_WATTS }),
    ]);
  });

  it('keeps Save off for more power than the laser has', async () => {
    renderDialog();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));
    enterPower(TOO_MUCH_POWER_WATTS);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
  });

  it('filters by search text', async () => {
    renderDialog([newPresetFixture(PLYWOOD, PROFILE), newPresetFixture(ACRYLIC, PROFILE)]);

    expect(await screen.findByText(PLYWOOD_NAME)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: SEARCH_LABEL }), { target: { value: 'acry' } });

    await waitFor(() => {
      expect(screen.queryByText(PLYWOOD_NAME)).not.toBeInTheDocument();
    });
    expect(screen.getByText(ACRYLIC_NAME)).toBeInTheDocument();
  });

  it('lists another machine only when the filter is off', async () => {
    renderDialog([newPresetFixture(PLYWOOD, OTHER_PROFILE)]);

    const onlyMachine: HTMLElement = await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL });

    expect(screen.queryByText(PLYWOOD_NAME)).not.toBeInTheDocument();
    fireEvent.click(onlyMachine);

    expect(await screen.findByText(PLYWOOD_NAME)).toBeInTheDocument();
  });

  it('edits and deletes a stored preset', async () => {
    const preset: MaterialPreset = newPresetFixture(PLYWOOD, PROFILE);
    const store: AppStore = renderDialog([preset]);

    fireEvent.click(await screen.findByText(PLYWOOD_NAME));
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));

    expect(selectMaterialPresets(store.getState())).toEqual([{ ...preset, powerWatts: NEW_POWER_WATTS }]);

    fireEvent.click(await screen.findByText(PLYWOOD_NAME));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, delete' }));

    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('shows the machine column and an unchecked filter when no machine is active', async () => {
    renderDialog([newPresetFixture(PLYWOOD, OTHER_PROFILE)], false);

    expect(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL })).not.toBeChecked();
    expect(screen.getByRole('columnheader', { name: 'Machine' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADD_LABEL })).toBeDisabled();
  });

  it('lets a preset of a deleted machine be deleted but not saved', async () => {
    const orphanPreset: MaterialPreset = newMaterialPreset({
      ...newPresetFixture(PLYWOOD, PROFILE),
      machineProfileId: 'machine-gone',
    });
    const store: AppStore = renderDialog([orphanPreset]);

    fireEvent.click(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL }));
    fireEvent.click(await screen.findByText(PLYWOOD_NAME));

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, delete' }));

    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('offers to apply a stored preset of the active machine only', async () => {
    renderDialog([newPresetFixture(PLYWOOD, OTHER_PROFILE)]);

    fireEvent.click(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL }));
    fireEvent.click(await screen.findByText(PLYWOOD_NAME));

    expect(screen.queryByRole('button', { name: APPLY_LABEL })).not.toBeInTheDocument();
  });

  it('applies a preset to the layer it was opened from as percent of the laser', async () => {
    const store: AppStore = newStore();
    const preset: MaterialPreset = newPresetFixture(PLYWOOD, PROFILE);

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
      store.dispatch(new MaterialSaved({ material: PLYWOOD }));
      store.dispatch(new MaterialPresetSaved({ preset }));
      store.dispatch(new ProjectObjectsAdded({
        objects: [LAYER_OBJECT],
        layers: getObjectsDerivedLayers([LAYER_OBJECT], DEFAULT_PALETTE, []),
      }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <MaterialLibraryDialog isOpen initialLayerKey={LAYER_COLOUR} onClose={() => undefined} />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(await screen.findByText(PLYWOOD_NAME));
    fireEvent.click(screen.getByRole('button', { name: APPLY_LABEL }));

    expect(selectProjectLayers(store.getState())[0]?.settings).toEqual(expect.objectContaining({
      maxPowerPercent: 50,
      speedMmPerMin: preset.speedMmPerMin,
      passes: preset.passes,
    }));
    expect(screen.getByText(/^Applied to/)).toBeInTheDocument();
  });

  it('does not apply a preset above the power of the laser', async () => {
    const tooStrongPreset: MaterialPreset = { ...newPresetFixture(PLYWOOD, PROFILE), powerWatts: TOO_MUCH_POWER_WATTS };

    renderDialog([tooStrongPreset]);
    fireEvent.click(await screen.findByText(PLYWOOD_NAME));

    expect(screen.getByRole('button', { name: APPLY_LABEL })).toBeDisabled();
    expect(screen.getByText(/more power than this laser/)).toBeInTheDocument();
  });

  it('imports a file for the active machine and rescales its power', async () => {
    const store: AppStore = renderDialog();
    const fileText: string = getMaterialPresetsFileText(
      [newPresetFixture(PLYWOOD, HALF_POWER_PROFILE)],
      [PLYWOOD],
      [HALF_POWER_PROFILE],
    );

    fireEvent.change(await screen.findByLabelText(IMPORT_INPUT_LABEL), {
      target: { files: [new File([fileText], IMPORT_FILE_NAME)] },
    });

    await waitFor(() => {
      expect(selectMaterialPresets(store.getState())).toEqual([
        expect.objectContaining({ machineProfileId: PROFILE.id, materialId: PLYWOOD.id, powerWatts: MAX_POWER_WATTS }),
      ]);
    });
  });

  it('changes nothing and shows the fixed toast for a bad file', async () => {
    const store: AppStore = renderDialog();

    fireEvent.change(await screen.findByLabelText(IMPORT_INPUT_LABEL), {
      target: { files: [new File(['nonsense'], IMPORT_FILE_NAME)] },
    });

    await waitFor(() => {
      expect(selectToasts(store.getState()).map(({ messageKey }: AppToast): string => messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_PRESETS_IMPORT_INVALID);
    });
    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('turns on Export for a ticked row without opening it for editing', async () => {
    renderDialog([newPresetFixture(PLYWOOD, PROFILE)]);

    await screen.findByText(PLYWOOD_NAME);
    expect(screen.getByRole('button', { name: 'Export selected (0)' })).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select for export' }));

    expect(screen.getByRole('button', { name: 'Export selected (1)' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: SAVE_LABEL })).not.toBeInTheDocument();
  });
});
