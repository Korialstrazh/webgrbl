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
import { selectIsMachineProfilesDialogOpen } from '../../utils/states/ui.workbench.state';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const LIBRARY_BUTTON_LABEL = 'Open the material library';
const LIBRARY_TITLE = 'Material library';
// The drawer is found by its title text: a role query over the whole antd drawer is slow in jsdom.
const DRAWER_ROOT_SELECTOR = '.ant-drawer';
const DRAWER_LEFT_CLASS_NAME = 'ant-drawer-left';
const MACHINE_NAME = 'Test Laser';
const PROFILE: MachineProfile = newMachineProfile({ name: MACHINE_NAME, maxPowerWatts: 10 });
const PLYWOOD: Material = newMaterial({ name: 'Plywood', thicknessMm: 3 });

const newPresetFixture = (): MaterialPreset => newMaterialPreset({
  materialId: PLYWOOD.id,
  machineProfileId: PROFILE.id,
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: 300,
  passes: 1,
  notes: '',
});

/** Renders the section and returns the bed region element the library drawer renders into. */
const renderSection = (store: AppStore): HTMLElement => {
  const { container } = render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialSection />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
  const bedRegionHost: Element | null = container.firstElementChild;

  if (!(bedRegionHost instanceof HTMLElement)) {
    throw new Error('No bed region host');
  }

  return bedRegionHost;
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

    expect(screen.getByRole('button', { name: '2 presets' })).toBeInTheDocument();
  });

  it('names the library it opens, not an add form, while there are no presets yet', () => {
    renderSection(newStoreWithMaterial(0));

    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add preset' })).not.toBeInTheDocument();
  });

  it('asks for a material when none is chosen, and for a machine when none is active', () => {
    const store: AppStore = newStore();

    renderSection(store);

    fireEvent.click(screen.getByRole('button', { name: 'Laser profile' }));
    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
    });
    expect(screen.getByRole('button', { name: 'Choose a material to see its presets' })).toBeInTheDocument();
  });

  it('captions the library button with one word', () => {
    renderSection(newStoreWithMaterial(1));

    expect(screen.getByRole('button', { name: LIBRARY_BUTTON_LABEL })).toHaveTextContent('Library');
  });

  it('opens the material library as a left drawer in the bed region from the book button', async () => {
    const bedRegionHost: HTMLElement = renderSection(newStoreWithMaterial(1));

    fireEvent.click(screen.getByRole('button', { name: LIBRARY_BUTTON_LABEL }));

    const drawerRoot: Element | null = (await screen.findByText(LIBRARY_TITLE)).closest(DRAWER_ROOT_SELECTOR);

    // A left drawer inside the bed region: it sits beside the Material panel and leaves the machine panel in view.
    expect(drawerRoot).toHaveClass(DRAWER_LEFT_CLASS_NAME);
    expect(bedRegionHost).toContainElement(drawerRoot instanceof HTMLElement ? drawerRoot : null);
  });

  it('opens the material library filtered to the project material from the summary link', async () => {
    renderSection(newStoreWithMaterial(1));

    fireEvent.click(screen.getByRole('button', { name: '1 preset' }));

    expect((await screen.findByText(LIBRARY_TITLE)).closest(DRAWER_ROOT_SELECTOR)).toBeInTheDocument();
    expect(screen.getByText('Filter: Plywood, 3 mm')).toBeInTheDocument();
  });
});
