import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider, useSelector } from 'react-redux';
import type { Mock, MockInstance } from 'vitest';
import { LayerSettingsDrawer } from '.';
import { ENTER_KEY } from '../../utils/browser/browser.events.constants';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getObjectsDerivedLayers } from '../../utils/layers/get.objects.derived.layers';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../../utils/layers/layer.constants';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import { DEFAULT_CUT_ENTRY, DEFAULT_FILL_ENTRY, DEFAULT_PALETTE } from '../../utils/palette/palette.constants';
import type { Material } from '../../utils/materials/interfaces/Material';
import { newMaterial } from '../../utils/materials/new.material';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { MachineProfilesLoaded } from '../../utils/states/machine.profile.state';
import { selectMaterialPresets } from '../../utils/states/material.preset.state';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { PaletteEntrySaved, selectPaletteEntries } from '../../utils/states/palette.state';
import {
  LayerPaletteEntryLinked,
  LayerSettingsChanged,
  ProjectMaterialSelected,
  ProjectObjectsAdded,
  selectProjectLayers,
} from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const CUT_COLOUR = DEFAULT_CUT_ENTRY.colour;
const FILL_COLOUR = DEFAULT_FILL_ENTRY.colour;
const UNKNOWN_COLOUR = '#123456';
const GREY_COLOUR = '#808080';
const PROFILE_ID = 'ten-watt';
const TEN_WATTS = 10;
const SIXTY_PERCENT = 60;
const NEW_SPEED_TEXT = '450';
const NEW_SPEED_MM_PER_MIN = 450;
const SPEED_LABEL = 'Speed (mm/min)';
const MAX_POWER_LABEL = 'Max power (%)';
const AIR_ASSIST_LABEL = 'Air assist';
const LINE_INTERVAL_LABEL = 'Line interval (mm)';
const SAVE_TO_PALETTE_LABEL = 'Save to palette';
const SEND_LABEL = 'Send to laser';
const FILL_MODE_LABEL = 'Fill';
const PRESET_LABEL = 'Save preset';
const SIXTY_PERCENT_WATTS_TEXT = '6.0 W';
const BAR_LABEL = 'Power from black to white';
const BLACK_END_TEXT = 'Black: 6.0 W';
const WHITE_END_TEXT = 'White: 0.0 W';
const BLACK_END_PERCENT_TEXT = 'Black: 60 %';
const DRAWER_ROOT_SELECTOR = '.ant-drawer';
const DRAWER_LEFT_CLASS_NAME = 'ant-drawer-left';
const DRAWER_MASK_SELECTOR = '.ant-drawer-mask';
const TRANSPARENT_MASK_CLASS_NAME = 'transparentMask';
const DRAWER_OVERLINE = 'Layer settings';
const CUT_LAYER_NAME = 'Cut';

const newColouredObject = (colour: string): ProjectObject => newProjectObject({
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${colour}" width="5" height="5"/></svg>`,
});

const loadColours = (store: AppStore, colours: string[]): void => {
  const objects: ProjectObject[] = colours.map(newColouredObject);

  act(() => {
    store.dispatch(new ProjectObjectsAdded({
      objects,
      layers: getObjectsDerivedLayers(objects, DEFAULT_PALETTE, []),
    }));
  });
};

const loadProfile = (store: AppStore, hasAirAssist: boolean): void => {
  act(() => {
    store.dispatch(new MachineProfilesLoaded({
      document: {
        version: 1,
        activeProfileId: PROFILE_ID,
        profiles: [newMachineProfile({ id: PROFILE_ID, maxPowerWatts: TEN_WATTS, hasAirAssist })],
      },
    }));
  });
};

const getLayer = (store: AppStore, layerKey: string): ProjectLayer => {
  const layer: ProjectLayer | undefined = selectProjectLayers(store.getState()).find(
    (candidate: ProjectLayer): boolean => getLayerKey(candidate) === layerKey,
  );

  if (!layer) {
    throw new Error(`No layer ${layerKey}`);
  }

  return layer;
};

interface LiveDrawerProps {
  layerKey: string;
  onEditPalette: () => void;
}

// The drawer shows what its parent passes, so the test parent follows the store like LayersSection does.
const LiveDrawer = ({ layerKey, onEditPalette }: LiveDrawerProps): ReactNode => {
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);

  return (
    <LayerSettingsDrawer
      layer={layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey)}
      onClose={vi.fn()}
      onEditPalette={onEditPalette}
    />
  );
};

/** Renders the drawer for one layer and returns the bed region element it renders into. */
const renderDrawer = (store: AppStore, layerKey: string, onEditPalette: () => void = vi.fn()): HTMLElement => {
  const { container } = render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <LiveDrawer layerKey={layerKey} onEditPalette={onEditPalette} />
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

const getActionCount = (dispatchSpy: MockInstance<AppDispatch>, actionType: string): number =>
  dispatchSpy.mock.calls.filter(
    ([dispatchedAction]: Parameters<AppDispatch>): boolean => dispatchedAction.type === actionType,
  ).length;

describe(LayerSettingsDrawer.name, () => {
  it('slides in from the left inside the bed region, next to the design panel', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    const bedRegionHost: HTMLElement = renderDrawer(store, CUT_COLOUR);
    const drawerRoot: Element | null = screen.getByRole('dialog').closest(DRAWER_ROOT_SELECTOR);

    expect(bedRegionHost).toContainElement(drawerRoot instanceof HTMLElement ? drawerRoot : null);
    expect(drawerRoot).toHaveClass(DRAWER_LEFT_CLASS_NAME);
  });

  it('keeps the bed visible under a clear mask that still closes the drawer when clicked', () => {
    const store: AppStore = newStore();
    const onClose: Mock<() => void> = vi.fn<() => void>();
    loadColours(store, [CUT_COLOUR]);
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <LayerSettingsDrawer
              layer={selectProjectLayers(store.getState())[0]}
              onClose={onClose}
              onEditPalette={vi.fn()}
            />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );
    const mask: HTMLElement | null = document.querySelector(DRAWER_MASK_SELECTOR);

    expect(mask?.className).toContain(TRANSPARENT_MASK_CLASS_NAME);

    fireEvent.click(mask ?? document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('titles the drawer with the layer name under a small overline', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderDrawer(store, CUT_COLOUR);

    const layerName: HTMLElement = within(screen.getByRole('dialog')).getByTitle(CUT_LAYER_NAME);

    expect(layerName).toHaveTextContent(CUT_LAYER_NAME);
    expect(layerName.previousElementSibling).toHaveTextContent(DRAWER_OVERLINE);
  });

  it('shows the watts of the active profile next to the power', () => {
    const store: AppStore = newStore();
    loadColours(store, [FILL_COLOUR]);
    loadProfile(store, false);
    act(() => {
      store.dispatch(new LayerSettingsChanged({ layerKey: FILL_COLOUR, settings: { maxPowerPercent: SIXTY_PERCENT } }));
    });
    renderDrawer(store, FILL_COLOUR);

    expect(screen.getByText(SIXTY_PERCENT_WATTS_TEXT)).toBeInTheDocument();
    expect(screen.getByLabelText(MAX_POWER_LABEL)).toHaveValue('60.0');
  });

  it('hides the watts without an active profile', () => {
    const store: AppStore = newStore();
    loadColours(store, [FILL_COLOUR]);
    renderDrawer(store, FILL_COLOUR);

    expect(screen.queryByText(/ W$/)).not.toBeInTheDocument();
  });

  it('commits a changed speed on blur as one change', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderDrawer(store, CUT_COLOUR);
    const speedInput: HTMLElement = screen.getByLabelText(SPEED_LABEL);

    fireEvent.change(speedInput, { target: { value: NEW_SPEED_TEXT } });

    expect(getActionCount(dispatchSpy, LayerSettingsChanged.type)).toBe(0);

    fireEvent.blur(speedInput);

    expect(getActionCount(dispatchSpy, LayerSettingsChanged.type)).toBe(1);
    expect(getLayer(store, CUT_COLOUR).settings.speedMmPerMin).toBe(NEW_SPEED_MM_PER_MIN);
  });

  it('commits on Enter, and a focus and blur alone commits nothing', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderDrawer(store, CUT_COLOUR);
    const speedInput: HTMLElement = screen.getByLabelText(SPEED_LABEL);

    fireEvent.focus(speedInput);
    fireEvent.blur(speedInput);

    expect(getActionCount(dispatchSpy, LayerSettingsChanged.type)).toBe(0);

    fireEvent.change(speedInput, { target: { value: NEW_SPEED_TEXT } });
    fireEvent.keyDown(speedInput, { key: ENTER_KEY });

    expect(getActionCount(dispatchSpy, LayerSettingsChanged.type)).toBe(1);
  });

  it('switches the mode, and shows the line interval for a fill only', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderDrawer(store, CUT_COLOUR);

    expect(screen.queryByLabelText(LINE_INTERVAL_LABEL)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: FILL_MODE_LABEL }));

    expect(getLayer(store, CUT_COLOUR).settings.mode).toBe(DEFAULT_FILL_ENTRY.mode);
    expect(screen.getByLabelText(LINE_INTERVAL_LABEL)).toBeInTheDocument();
  });

  it('shows air assist only when the profile has it', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    loadProfile(store, false);
    renderDrawer(store, CUT_COLOUR);

    expect(screen.queryByText(AIR_ASSIST_LABEL)).not.toBeInTheDocument();
  });

  it('shows and switches air assist for a profile that has it', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    loadProfile(store, true);
    renderDrawer(store, CUT_COLOUR);

    fireEvent.click(screen.getByRole('switch', { name: AIR_ASSIST_LABEL }));

    expect(getLayer(store, CUT_COLOUR).settings.airAssist).toBe(true);
  });

  it('switches the layer on and off with the send switch', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderDrawer(store, CUT_COLOUR);

    fireEvent.click(screen.getByRole('switch', { name: SEND_LABEL }));

    expect(getLayer(store, CUT_COLOUR).enabled).toBe(false);
  });

  it('shows the black to white bar with the power at both ends for the shading layer', () => {
    const store: AppStore = newStore();
    loadColours(store, [GREY_COLOUR]);
    loadProfile(store, false);
    renderDrawer(store, SHADING_LAYER_COLOUR);

    expect(screen.getByText(BLACK_END_TEXT)).toBeInTheDocument();
    expect(screen.getByText(WHITE_END_TEXT)).toBeInTheDocument();
  });

  it('shows the bar ends in percent without a profile, and no bar for a colour layer', () => {
    const store: AppStore = newStore();
    loadColours(store, [GREY_COLOUR, CUT_COLOUR]);
    renderDrawer(store, SHADING_LAYER_COLOUR);

    expect(screen.getByText(BLACK_END_PERCENT_TEXT)).toBeInTheDocument();

    cleanup();
    renderDrawer(store, CUT_COLOUR);

    expect(screen.queryByRole('group', { name: BAR_LABEL })).not.toBeInTheDocument();
  });

  it('leaves an unknown colour disabled when it is saved to the palette', () => {
    const store: AppStore = newStore();
    loadColours(store, [UNKNOWN_COLOUR]);
    renderDrawer(store, UNKNOWN_COLOUR);

    expect(getLayer(store, UNKNOWN_COLOUR).enabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: SAVE_TO_PALETTE_LABEL }));

    expect(getLayer(store, UNKNOWN_COLOUR).enabled).toBe(false);
  });

  it('drops a typed draft when another layer opens', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR, FILL_COLOUR]);
    const cutSpeedBefore: number = getLayer(store, CUT_COLOUR).settings.speedMmPerMin;
    const fillSpeedBefore: number = getLayer(store, FILL_COLOUR).settings.speedMmPerMin;
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const { rerender } = render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <LiveDrawer layerKey={CUT_COLOUR} onEditPalette={vi.fn()} />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.change(screen.getByLabelText(SPEED_LABEL), { target: { value: NEW_SPEED_TEXT } });
    rerender(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <LiveDrawer layerKey={FILL_COLOUR} onEditPalette={vi.fn()} />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );
    fireEvent.blur(screen.getByLabelText(SPEED_LABEL));

    expect(getActionCount(dispatchSpy, LayerSettingsChanged.type)).toBe(0);
    expect(getLayer(store, FILL_COLOUR).settings.speedMmPerMin).toBe(fillSpeedBefore);
    expect(getLayer(store, CUT_COLOUR).settings.speedMmPerMin).toBe(cutSpeedBefore);
  });

  it('saves the layer settings to its palette entry', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    act(() => {
      store.dispatch(
        new LayerSettingsChanged({ layerKey: CUT_COLOUR, settings: { speedMmPerMin: NEW_SPEED_MM_PER_MIN } }),
      );
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    renderDrawer(store, CUT_COLOUR);

    fireEvent.click(screen.getByRole('button', { name: SAVE_TO_PALETTE_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      new PaletteEntrySaved({ entry: { ...DEFAULT_CUT_ENTRY, speedMmPerMin: NEW_SPEED_MM_PER_MIN } }),
    );
    expect(getActionCount(dispatchSpy, LayerPaletteEntryLinked.type)).toBe(0);
  });

  it('creates a palette entry for an unknown colour and links the layer to it', () => {
    const store: AppStore = newStore();
    loadColours(store, [UNKNOWN_COLOUR]);
    renderDrawer(store, UNKNOWN_COLOUR);

    fireEvent.click(screen.getByRole('button', { name: SAVE_TO_PALETTE_LABEL }));

    const createdEntry: PaletteEntry | undefined = selectPaletteEntries(store.getState()).find(
      (entry: PaletteEntry): boolean => entry.colour === UNKNOWN_COLOUR,
    );

    expect(createdEntry?.name).toBe(UNKNOWN_COLOUR);
    expect(getLayer(store, UNKNOWN_COLOUR).paletteEntryId).toBe(createdEntry?.id);
  });

  it('shows Save preset as a disabled button with a Soon tag', () => {
    const store: AppStore = newStore();
    loadColours(store, [CUT_COLOUR]);
    renderDrawer(store, CUT_COLOUR);

    const presetButton: HTMLElement = screen.getByRole('button', { name: PRESET_LABEL });

    expect(presetButton).toBeDisabled();
    expect(screen.getByRole('button', { name: PRESET_LABEL }))
      .toHaveAccessibleDescription(/Pick the material of the project/);
  });

  it('saves the layer as a preset of the project material and the active machine, in watts', () => {
    const store: AppStore = newStore();
    const material: Material = newMaterial();

    loadProfile(store, false);
    loadColours(store, [CUT_COLOUR]);
    act(() => {
      store.dispatch(new MaterialSaved({ material }));
      store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
      store.dispatch(new LayerSettingsChanged({ layerKey: CUT_COLOUR, settings: { maxPowerPercent: SIXTY_PERCENT } }));
    });
    renderDrawer(store, CUT_COLOUR);

    fireEvent.click(screen.getByRole('button', { name: PRESET_LABEL }));

    expect(selectMaterialPresets(store.getState())).toEqual([
      expect.objectContaining({ materialId: material.id, machineProfileId: PROFILE_ID, powerWatts: 6 }),
    ]);
    expect(screen.getByRole('status')).toHaveTextContent(`Saved ${material.name}, ${material.thicknessMm} mm`);
    expect(screen.getByRole('status')).toHaveTextContent('Cut');
  });

  it('asks whether to update the preset of the same material, operation and machine, or save a new one', async () => {
    const store: AppStore = newStore();
    const material: Material = newMaterial();

    loadProfile(store, false);
    loadColours(store, [CUT_COLOUR]);
    act(() => {
      store.dispatch(new MaterialSaved({ material }));
      store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
      store.dispatch(new LayerSettingsChanged({ layerKey: CUT_COLOUR, settings: { maxPowerPercent: SIXTY_PERCENT } }));
    });
    renderDrawer(store, CUT_COLOUR);
    fireEvent.click(screen.getByRole('button', { name: PRESET_LABEL }));

    const [storedPreset] = selectMaterialPresets(store.getState());

    act(() => {
      store.dispatch(new LayerSettingsChanged({ layerKey: CUT_COLOUR, settings: { passes: 3 } }));
    });
    fireEvent.click(screen.getByRole('button', { name: PRESET_LABEL }));

    expect(await screen.findByText(/already has a preset for/)).toBeInTheDocument();
    // The question replaces the stale confirmation of the first save, and Cancel keeps everything as it was.
    expect(screen.getByRole('status')).toHaveTextContent('');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(selectMaterialPresets(store.getState())).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: PRESET_LABEL }));
    fireEvent.click(await screen.findByRole('button', { name: 'Update existing' }));

    expect(selectMaterialPresets(store.getState()))
      .toEqual([expect.objectContaining({ id: storedPreset?.id, passes: 3 })]);
    expect(screen.getByRole('status')).toHaveTextContent(/^Updated/);

    fireEvent.click(screen.getByRole('button', { name: PRESET_LABEL }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save as new' }));

    expect(selectMaterialPresets(store.getState())).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent(/^Saved/);
  });
});
