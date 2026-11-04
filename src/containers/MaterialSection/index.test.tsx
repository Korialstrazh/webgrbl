import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { MaterialSection } from '.';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../utils/materials/interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from '../../utils/materials/material.preset.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { newMaterialPreset } from '../../utils/materials/new.material.preset';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { MaterialPresetSaved } from '../../utils/states/material.preset.state';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const LIBRARY_BUTTON_LABEL = 'Open the material library';
const LIBRARY_TITLE = 'Material library';
// The dialog is found by its title text: a role query over the whole antd dialog is slow in jsdom.
const DIALOG_SELECTOR = '[role="dialog"]';
const MACHINE_NAME = 'Test Laser';
const PROFILE: MachineProfile = newMachineProfile({ name: MACHINE_NAME, maxPowerWatts: 10 });
const PLYWOOD: Material = newMaterial({ name: 'Plywood' });

const newPresetFixture = (): MaterialPreset => newMaterialPreset({
  materialId: PLYWOOD.id,
  machineProfileId: PROFILE.id,
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: 300,
  passes: 1,
  notes: '',
});

const renderSection = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialSection />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const newStoreWithMaterial = (presetCount: number): AppStore => {
  const store: AppStore = newStore();

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
    store.dispatch(new MaterialSaved({ material: PLYWOOD }));
    store.dispatch(new ProjectMaterialSelected({ materialId: PLYWOOD.id }));

    for (let presetIndex = 0; presetIndex < presetCount; presetIndex++) {
      store.dispatch(new MaterialPresetSaved({ preset: newPresetFixture() }));
    }
  });

  return store;
};

describe(MaterialSection.name, () => {
  it('counts the presets of the project material on the active machine', () => {
    renderSection(newStoreWithMaterial(2));

    expect(screen.getByRole('button', { name: `2 presets for ${MACHINE_NAME}` })).toBeInTheDocument();
  });

  it('says there are no presets yet', () => {
    renderSection(newStoreWithMaterial(0));

    expect(screen.getByRole('button', { name: `No presets yet for ${MACHINE_NAME}` })).toBeInTheDocument();
  });

  it('asks for a material when none is chosen, and for a machine when none is active', () => {
    const store: AppStore = newStore();

    renderSection(store);

    expect(screen.getByRole('button', { name: 'Pick an active machine to use presets' })).toBeInTheDocument();
    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
    });
    expect(screen.getByRole('button', { name: 'Choose a material to see its presets' })).toBeInTheDocument();
  });

  it('opens the material library from the book button', async () => {
    renderSection(newStoreWithMaterial(1));

    fireEvent.click(screen.getByRole('button', { name: LIBRARY_BUTTON_LABEL }));

    expect((await screen.findByText(LIBRARY_TITLE)).closest(DIALOG_SELECTOR)).toBeInTheDocument();
  });

  it('opens the material library from the summary line', async () => {
    renderSection(newStoreWithMaterial(1));

    fireEvent.click(screen.getByRole('button', { name: `1 preset for ${MACHINE_NAME}` }));

    expect((await screen.findByText(LIBRARY_TITLE)).closest(DIALOG_SELECTOR)).toBeInTheDocument();
  });
});
