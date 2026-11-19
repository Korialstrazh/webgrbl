import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { MaterialLibraryDrawer } from '.';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getMaterialPresetsFileText } from '../../utils/materials/get.material.presets.file.text';
import { MATERIAL_PRESET_REPOSITORY } from '../../utils/materials/material.preset.repository';
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
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import {
  ProjectMaterialSelected,
  ProjectObjectsAdded,
  selectProjectLayers,
} from '../../utils/states/project.document.state';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import { selectToasts } from '../../utils/states/toast.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

// Buttons in and beside the table are found by their label or text: a role query with a name computes the name of
// every button in the drawer through jsdom's slow getComputedStyle and takes tens of seconds.
const APPLY_LABEL = 'Apply to layer';
const LAYER_COLOUR = '#ff0000';
const LAYER_OBJECT: ProjectObject = newProjectObject({
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${LAYER_COLOUR}" width="5" height="5"/></svg>`,
});
const IMPORT_FILE_NAME = 'presets.json';
const MORE_LABEL = 'More file actions';
const IMPORT_INPUT_LABEL = 'Open a material presets file';
const POWER_LABEL = 'Power (W)';
const SAVE_LABEL = 'Save';
const ADD_LABEL = 'Add preset';
const SEARCH_LABEL = 'Search presets';
const ONLY_MACHINE_LABEL = 'Only for this laser';
const BACK_LABEL = 'Back';
const DELETE_LABEL = 'Delete';
const NEW_PRESET_HEADING = 'New preset';
const SAVED_TEXT = 'Preset saved.';
const DELETED_TEXT = 'Preset deleted.';
const ROW_APPLY_LABEL = 'Apply to Cut';
const ENTER_KEY = 'Enter';
const NEW_POWER_WATTS = 4;
const TOO_MUCH_POWER_WATTS = 11;
const MAX_POWER_WATTS = 10;
const PLYWOOD_NAME = 'Plywood';
const HALF_POWER_PERCENT_TEXT = '50 %';
const ACRYLIC_NAME = 'Acrylic';
const RENAMED_ACRYLIC_NAME = 'Cast acrylic';
const OTHER_MACHINE_NAME = 'Other laser';
const NEW_MATERIAL_LABEL = 'New material';
const NEW_MATERIAL_OPTION = 'New material\u2026';
const MATERIAL_NAME_LABEL = 'Name';
const MATERIAL_THICKNESS_LABEL = 'Thickness (mm)';
const MATERIAL_DIALOG_SAVE_LABEL = 'Save';
const MATERIAL_DIALOG_SELECTOR = '.ant-modal';
const BIRCH_NAME = 'Birch';
const BIRCH_THICKNESS_MM = 4;
const LAYER_SELECT_LABEL = 'Layer';
const CUT_THROUGH_NOTE_TEXT = 'Did not cut through last time. Consider an extra pass or more power.';
const CUT_THROUGH_DISMISS_LABEL = 'Dismiss';

const PROFILE: MachineProfile = newMachineProfile({ maxPowerWatts: MAX_POWER_WATTS });
const OTHER_PROFILE: MachineProfile = newMachineProfile({ name: OTHER_MACHINE_NAME, maxPowerWatts: MAX_POWER_WATTS });
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

interface RenderDrawerOptions {
  hasActiveProfile?: boolean;
  initialMaterialId?: string;
}

const renderDrawer = (presets: MaterialPreset[] = [], options: RenderDrawerOptions = {}): AppStore => {
  const { hasActiveProfile = true, initialMaterialId } = options;
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
          <MaterialLibraryDrawer isOpen initialMaterialId={initialMaterialId} onClose={() => undefined} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );

  return store;
};

const renderDrawerForLayer = (presets: MaterialPreset[]): AppStore => {
  const store: AppStore = newStore();

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
    store.dispatch(new MachineProfileSaved({ profile: OTHER_PROFILE }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
    store.dispatch(new MaterialSaved({ material: PLYWOOD }));
    store.dispatch(new MaterialSaved({ material: ACRYLIC }));
    presets.forEach((preset: MaterialPreset) => store.dispatch(new MaterialPresetSaved({ preset })));
    store.dispatch(new ProjectObjectsAdded({
      objects: [LAYER_OBJECT],
      layers: getObjectsDerivedLayers([LAYER_OBJECT], DEFAULT_PALETTE, []),
    }));
  });
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialLibraryDrawer isOpen initialLayerKey={LAYER_COLOUR} onClose={() => undefined} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );

  return store;
};

/**
 * Waits until the saga has written the presets of the state: a write still in flight when a test ends would reopen
 * the database after its cleanup and leak the presets into the next test.
 */
const waitForStoredPresetCount = async (count: number): Promise<void> => {
  await waitFor(async () => {
    expect(await MATERIAL_PRESET_REPOSITORY.listMaterialPresets()).toHaveLength(count);
  });
};

/** A row names its preset "<material>, <thickness> mm / <operation>", so a row is found by the start of that. */
const getRowNamePattern = (materialName: string): RegExp => new RegExp(`^${materialName}, `);

const enterPower = (powerWatts: number): void => {
  fireEvent.change(screen.getByRole('spinbutton', { name: POWER_LABEL }), { target: { value: String(powerWatts) } });
};

/**
 * Fills and saves the open material dialog with Birch, 4 mm. The dialog is found from its name field: a role query
 * for the dialog over the whole drawer is slow in jsdom.
 */
const addMaterialInDialog = (): void => {
  const nameInput: HTMLElement = screen.getByLabelText(MATERIAL_NAME_LABEL);
  const dialogElement: HTMLElement | null = nameInput.closest(MATERIAL_DIALOG_SELECTOR);

  if (!dialogElement) {
    throw new Error('No material dialog');
  }

  fireEvent.change(nameInput, { target: { value: BIRCH_NAME } });
  fireEvent.change(screen.getByLabelText(MATERIAL_THICKNESS_LABEL), { target: { value: String(BIRCH_THICKNESS_MM) } });
  fireEvent.click(within(dialogElement).getByRole('button', { name: MATERIAL_DIALOG_SAVE_LABEL }));
};

describe(MaterialLibraryDrawer.name, () => {
  it('shows the cut-through note on a preset, also when applying to a layer, and clears it on dismiss', async () => {
    const preset: MaterialPreset = { ...newPresetFixture(PLYWOOD, PROFILE), isCutThroughNoteShown: true };
    const store: AppStore = renderDrawerForLayer([preset]);

    expect(await screen.findByText(CUT_THROUGH_NOTE_TEXT)).toBeInTheDocument();
    expect(screen.getByLabelText(ROW_APPLY_LABEL)).toBeInTheDocument();

    fireEvent.click(screen.getByText(CUT_THROUGH_DISMISS_LABEL));

    expect(screen.queryByText(CUT_THROUGH_NOTE_TEXT)).not.toBeInTheDocument();
    expect(selectMaterialPresets(store.getState())[0]?.isCutThroughNoteShown).toBe(false);
    await waitForStoredPresetCount(1);
  });

  it('keeps Import and Export in the More menu of the header, each with its caption', async () => {
    renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: MORE_LABEL }));

    expect(await screen.findByRole('menuitem', { name: /Import/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Tick presets to export/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('saves a new preset for the active machine once a power is entered', async () => {
    const store: AppStore = renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));

    const saveButton: HTMLElement = screen.getByRole('button', { name: SAVE_LABEL });

    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('heading', { name: NEW_PRESET_HEADING })).toBeInTheDocument();
    // The power is what the user came to type, so it has the focus.
    expect(screen.getByRole('spinbutton', { name: POWER_LABEL })).toHaveFocus();
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(saveButton);

    expect(selectMaterialPresets(store.getState())).toEqual([
      expect.objectContaining({ machineProfileId: PROFILE.id, powerWatts: NEW_POWER_WATTS }),
    ]);
    // The saved preset stays open, now named, with nothing left to save, and the save is confirmed.
    expect(screen.getByRole('heading', { name: `${PLYWOOD_NAME}, 3 mm \u00B7 Cut` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(SAVED_TEXT);
    await waitForStoredPresetCount(1);
  });

  it('starts a new preset with the project material, and shows no error before a number is touched', async () => {
    const store: AppStore = renderDrawer();

    act(() => {
      store.dispatch(new ProjectMaterialSelected({ materialId: ACRYLIC.id }));
    });
    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));

    expect(screen.getByText(new RegExp(`^${ACRYLIC_NAME}, `))).toBeInTheDocument();
    expect(screen.queryByText(/Enter a power/)).not.toBeInTheDocument();
    fireEvent.blur(screen.getByRole('spinbutton', { name: POWER_LABEL }));
    expect(screen.getByText(/Enter a power/)).toBeInTheDocument();
  });

  it('goes back to the list on Back without saving', async () => {
    const store: AppStore = renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(screen.getByRole('button', { name: BACK_LABEL }));

    expect(screen.queryByRole('button', { name: SAVE_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADD_LABEL })).toBeInTheDocument();
    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('keeps Save off for more power than the laser has', async () => {
    renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));
    enterPower(TOO_MUCH_POWER_WATTS);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
  });

  it('filters by search text', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE), newPresetFixture(ACRYLIC, PROFILE)]);

    expect(await screen.findByText(getRowNamePattern(PLYWOOD_NAME))).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: SEARCH_LABEL }), { target: { value: 'acry' } });

    await waitFor(() => {
      expect(screen.queryByText(getRowNamePattern(PLYWOOD_NAME))).not.toBeInTheDocument();
    });
    expect(screen.getByText(getRowNamePattern(ACRYLIC_NAME))).toBeInTheDocument();
  });

  it('keeps to the material it was opened for until the filter chip is removed', async () => {
    renderDrawer(
      [newPresetFixture(PLYWOOD, PROFILE), newPresetFixture(ACRYLIC, PROFILE)],
      { initialMaterialId: ACRYLIC.id },
    );

    expect(await screen.findByText(getRowNamePattern(ACRYLIC_NAME))).toBeInTheDocument();
    expect(screen.queryByText(getRowNamePattern(PLYWOOD_NAME))).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Show all materials'));

    expect(await screen.findByText(getRowNamePattern(PLYWOOD_NAME))).toBeInTheDocument();
    expect(screen.queryByText(/^Filter: /)).not.toBeInTheDocument();
  });

  it('renames the filtered material in place from the pencil beside its chip, keeping its presets', async () => {
    const store: AppStore = renderDrawer([newPresetFixture(ACRYLIC, PROFILE)], { initialMaterialId: ACRYLIC.id });

    fireEvent.click(await screen.findByRole('button', { name: `Rename or change the thickness of ${ACRYLIC_NAME}` }));
    fireEvent.change(await screen.findByLabelText('Name'), { target: { value: RENAMED_ACRYLIC_NAME } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(selectMaterials(store.getState()).find(({ id }: Material): boolean => id === ACRYLIC.id)?.name)
      .toBe(RENAMED_ACRYLIC_NAME);
    expect(await screen.findByText(getRowNamePattern(RENAMED_ACRYLIC_NAME))).toBeInTheDocument();
  });

  it('shows an empty list without column headers', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)], { initialMaterialId: ACRYLIC.id });

    expect(await screen.findByText(`No presets yet for ${ACRYLIC_NAME}, 3 mm`)).toBeInTheDocument();
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
  });

  it('says the filtered material has no presets yet and starts a new preset with it', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)], { initialMaterialId: ACRYLIC.id });

    expect(await screen.findByText(`No presets yet for ${ACRYLIC_NAME}, 3 mm`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ADD_LABEL }));

    expect(screen.getByText(new RegExp(`^${ACRYLIC_NAME}, `))).toBeInTheDocument();
  });

  it('lists another machine only when the filter is off, without a percent of the active laser', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, OTHER_PROFILE)]);

    const onlyMachine: HTMLElement = await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL });

    expect(screen.queryByText(getRowNamePattern(PLYWOOD_NAME))).not.toBeInTheDocument();
    fireEvent.click(onlyMachine);

    expect(await screen.findByText(getRowNamePattern(PLYWOOD_NAME))).toBeInTheDocument();
    expect(screen.getByText('5 W')).toBeInTheDocument();
    expect(screen.queryByText(HALF_POWER_PERCENT_TEXT)).not.toBeInTheDocument();
  });

  it('shows the power of a preset of the active laser as percent beside the watts and under the field', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)]);

    expect(await screen.findByText(HALF_POWER_PERCENT_TEXT)).toBeInTheDocument();
    fireEvent.click(screen.getByText(getRowNamePattern(PLYWOOD_NAME)));

    expect(screen.getByText('50 % of this 10 W laser')).toBeInTheDocument();
  });

  it('edits and deletes a stored preset', async () => {
    const preset: MaterialPreset = newPresetFixture(PLYWOOD, PROFILE);
    const store: AppStore = renderDrawer([preset]);

    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));

    expect(selectMaterialPresets(store.getState())).toEqual([{ ...preset, powerWatts: NEW_POWER_WATTS }]);

    fireEvent.click(screen.getByRole('button', { name: DELETE_LABEL }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, delete' }));

    expect(selectMaterialPresets(store.getState())).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent(DELETED_TEXT);
  });

  it('keeps Save off for a stored preset until a field changes', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)]);

    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    enterPower(NEW_POWER_WATTS);
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeEnabled();
  });

  it('opens a row with the keyboard', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)]);

    const row: HTMLElement = await screen.findByRole('row', { name: new RegExp(PLYWOOD_NAME) });

    expect(row).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(row, { key: ENTER_KEY });

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeInTheDocument();
  });

  it('names the machine of each row and unchecks the filter when no machine is active', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, OTHER_PROFILE)], { hasActiveProfile: false });

    expect(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL })).not.toBeChecked();
    expect(screen.getByText(new RegExp(OTHER_MACHINE_NAME))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: ADD_LABEL })).not.toBeInTheDocument();
  });

  it('lets a preset of a deleted machine be deleted but not saved', async () => {
    const orphanPreset: MaterialPreset = newMaterialPreset({
      ...newPresetFixture(PLYWOOD, PROFILE),
      machineProfileId: 'machine-gone',
    });
    const store: AppStore = renderDrawer([orphanPreset]);

    fireEvent.click(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL }));
    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: DELETE_LABEL }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, delete' }));

    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('keeps Apply off for a preset of another machine and says why', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, OTHER_PROFILE)]);

    fireEvent.click(await screen.findByRole('checkbox', { name: ONLY_MACHINE_LABEL }));
    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));

    expect(screen.getByRole('button', { name: APPLY_LABEL })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent('Only a preset of the active laser can be applied.');
  });

  it('keeps Apply off for a new preset until it is saved, with the layer select labelled', async () => {
    renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));

    expect(screen.getByRole('group', { name: 'Apply to a layer' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: LAYER_SELECT_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: APPLY_LABEL })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent('Save the preset first');
  });

  it('applies a preset to the layer it was opened from as percent of the laser', async () => {
    const preset: MaterialPreset = newPresetFixture(PLYWOOD, PROFILE);
    const store: AppStore = renderDrawerForLayer([preset]);

    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));
    fireEvent.click(screen.getByLabelText(APPLY_LABEL));

    expect(selectProjectLayers(store.getState())[0]?.settings).toEqual(expect.objectContaining({
      maxPowerPercent: 50,
      speedMmPerMin: preset.speedMmPerMin,
      passes: preset.passes,
    }));
    expect(screen.getByRole('status')).toHaveTextContent(/^Applied to/);
  });

  it('names the layer and applies a row to it with one click', async () => {
    const preset: MaterialPreset = newPresetFixture(PLYWOOD, PROFILE);
    const store: AppStore = renderDrawerForLayer([preset]);

    expect(await screen.findByText('Layer: Cut')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(ROW_APPLY_LABEL));

    expect(selectProjectLayers(store.getState())[0]?.settings).toEqual(expect.objectContaining({
      maxPowerPercent: 50,
      speedMmPerMin: preset.speedMmPerMin,
    }));
    // The row confirms in place of its button, and applies without opening the row for editing.
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.queryByLabelText(ROW_APPLY_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
  });

  it('gives no row button to a preset above the power of the laser or of another machine', async () => {
    const tooStrongPreset: MaterialPreset = { ...newPresetFixture(PLYWOOD, PROFILE), powerWatts: TOO_MUCH_POWER_WATTS };

    renderDrawerForLayer([tooStrongPreset, newPresetFixture(ACRYLIC, OTHER_PROFILE)]);
    await screen.findByText(getRowNamePattern(PLYWOOD_NAME));
    fireEvent.click(screen.getByRole('checkbox', { name: ONLY_MACHINE_LABEL }));
    await screen.findByText(getRowNamePattern(ACRYLIC_NAME));

    expect(screen.getAllByLabelText(/more power than this laser/)).toHaveLength(1);
    expect(screen.getByLabelText(/more power than this laser/)).toBeDisabled();
    expect(screen.queryByLabelText(ROW_APPLY_LABEL)).not.toBeInTheDocument();
  });

  it('shows a friendly empty state that clears the search', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)]);

    await screen.findByText(getRowNamePattern(PLYWOOD_NAME));
    fireEvent.change(screen.getByRole('searchbox', { name: SEARCH_LABEL }), { target: { value: 'zzz' } });

    expect(await screen.findByText('Nothing matches "zzz"')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear search'));
    expect(await screen.findByText(getRowNamePattern(PLYWOOD_NAME))).toBeInTheDocument();
  });

  it('offers New material right in the empty library, which filters the list to the new material', async () => {
    const store: AppStore = newStore();

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: PROFILE }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: PROFILE.id }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <MaterialLibraryDrawer isOpen onClose={() => undefined} />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    expect(await screen.findByText('No materials yet')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('note')).getByText(NEW_MATERIAL_LABEL));
    addMaterialInDialog();

    expect(selectMaterials(store.getState())).toHaveLength(1);
    expect(await screen.findByText(`Filter: ${BIRCH_NAME}, ${BIRCH_THICKNESS_MM} mm`)).toBeInTheDocument();
    expect(screen.getByText(`No presets yet for ${BIRCH_NAME}, ${BIRCH_THICKNESS_MM} mm`)).toBeInTheDocument();
    // With none chosen yet, the first material the project gets is this one.
    expect(selectActiveMaterial(store.getState())?.name).toBe(BIRCH_NAME);
  });

  it('adds a material from the edit view, which goes to the draft and to a project with none', async () => {
    const store: AppStore = renderDrawer();

    fireEvent.click(await screen.findByRole('button', { name: ADD_LABEL }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Material' }));
    fireEvent.click(await screen.findByText(NEW_MATERIAL_OPTION));
    addMaterialInDialog();
    enterPower(NEW_POWER_WATTS);
    fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));

    const [birch]: Material[] = selectMaterials(store.getState()).filter(({ name }: Material) => name === BIRCH_NAME);

    expect(selectMaterialPresets(store.getState())).toEqual([expect.objectContaining({ materialId: birch?.id })]);
    expect(selectActiveMaterial(store.getState())?.id).toBe(birch?.id);
    await waitForStoredPresetCount(1);
  });

  it('does not apply a preset above the power of the laser', async () => {
    const tooStrongPreset: MaterialPreset = { ...newPresetFixture(PLYWOOD, PROFILE), powerWatts: TOO_MUCH_POWER_WATTS };

    renderDrawer([tooStrongPreset]);
    fireEvent.click(await screen.findByText(getRowNamePattern(PLYWOOD_NAME)));

    expect(screen.getByRole('button', { name: APPLY_LABEL })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent(/more power than this laser/);
    await waitForStoredPresetCount(1);
  });

  it('imports a file for the active machine and rescales its power', async () => {
    const store: AppStore = renderDrawer();
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
    await waitForStoredPresetCount(1);
  });

  it('changes nothing and shows the fixed toast for a bad file', async () => {
    const store: AppStore = renderDrawer();

    fireEvent.change(await screen.findByLabelText(IMPORT_INPUT_LABEL), {
      target: { files: [new File(['nonsense'], IMPORT_FILE_NAME)] },
    });

    await waitFor(() => {
      expect(selectToasts(store.getState()).map(({ messageKey }: AppToast): string => messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_PRESETS_IMPORT_INVALID);
    });
    expect(selectMaterialPresets(store.getState())).toEqual([]);
  });

  it('turns on Export for a ticked row without opening it, and counts only once there is a tick', async () => {
    renderDrawer([newPresetFixture(PLYWOOD, PROFILE)]);

    await screen.findByText(getRowNamePattern(PLYWOOD_NAME));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select for export' }));
    fireEvent.click(screen.getByRole('button', { name: MORE_LABEL }));

    expect(await screen.findByRole('menuitem', { name: /Export \(1\)/ })).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: SAVE_LABEL })).not.toBeInTheDocument();
  });
});
