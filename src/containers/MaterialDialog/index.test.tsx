import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MaterialDialog } from '.';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import type { Material } from '../../utils/materials/interfaces/Material';
import { DEFAULT_MATERIAL_THICKNESS_MM } from '../../utils/materials/material.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectMaterialSelected, selectProjectLayers } from '../../utils/states/project.document.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const USE_EXISTING_LABEL = 'Use that one';
const NAME_LABEL = 'Name';
const THICKNESS_LABEL = 'Thickness (mm)';
const SAVE_LABEL = 'Save';
const CANCEL_LABEL = 'Cancel';
const THICKNESS_ERROR = 'Enter a thickness from 0.1 to 100 mm.';
const NAME_ERROR = 'Enter a name of 1 to 100 characters.';
const SAVE_HINT = 'Name needed';
const NAME_CAPTION = 'Name';
const THICKNESS_CAPTION = 'Thickness';
const ENTERED_NAME = '  Birch 4 mm ';
const STORED_NAME = 'Birch 4 mm';
const ENTERED_THICKNESS_MM = 4;
const RENAMED_NAME = 'Oak 6 mm';
const CHANGED_THICKNESS_MM = 6;
const EDIT_TITLE = 'Edit material';
const NAME_TAKEN_ERROR = 'Another material already has this name and thickness.';

const renderDialog = (
  store: AppStore,
  onClose: () => void = vi.fn(),
  onMaterialChosen?: (materialId: string) => void,
): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialDialog isOpen onClose={onClose} onMaterialChosen={onMaterialChosen} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const enterThickness = (thicknessText: string): void => {
  fireEvent.change(screen.getByLabelText(THICKNESS_LABEL), { target: { value: thicknessText } });
};

const clickSave = (): void => {
  fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));
};

const MODAL_MASK_SELECTOR = '.ant-modal-mask';

describe(MaterialDialog.name, () => {
  describe('with a caller that takes the chosen material', () => {
    const saveNewMaterial = (store: AppStore): void => {
      renderDialog(store, vi.fn(), vi.fn());
      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ENTERED_NAME } });
      clickSave();
    };

    it('makes the new material the project material when none is chosen', () => {
      const store: AppStore = newStore();

      saveNewMaterial(store);

      expect(selectActiveMaterial(store.getState())?.name).toBe(STORED_NAME);
    });

    it('keeps the project material when one is already chosen', () => {
      const store: AppStore = newStore();
      const chosenMaterial: Material = newMaterial({ name: 'Oak', thicknessMm: ENTERED_THICKNESS_MM });

      store.dispatch(new MaterialSaved({ material: chosenMaterial }));
      store.dispatch(new ProjectMaterialSelected({ materialId: chosenMaterial.id }));
      saveNewMaterial(store);

      expect(selectActiveMaterial(store.getState())?.id).toBe(chosenMaterial.id);
    });

    it('leaves the layers exactly as they were when it selects the new material', () => {
      const store: AppStore = newStore();
      const layersBefore: ProjectLayer[] = selectProjectLayers(store.getState());

      saveNewMaterial(store);

      expect(selectProjectLayers(store.getState())).toBe(layersBefore);
    });
  });

  it('dims the whole window like the other dialogs, not only the bed region', () => {
    renderDialog(newStore());

    // The bed region stand-in is the first child of the render container; a whole-window dialog sits in the body.
    expect(document.body.firstElementChild?.querySelector(MODAL_MASK_SELECTOR)).not.toBeInTheDocument();
    expect(document.querySelector(MODAL_MASK_SELECTOR)).toBeInTheDocument();
  });

  it('registers an overlay, starts with an empty name in focus and Save as the primary, off until named', async () => {
    const store: AppStore = newStore();

    renderDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('');
    await waitFor(() => expect(screen.getByLabelText(NAME_LABEL)).toHaveFocus());
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toHaveClass('ant-btn-primary');
    expect(screen.getByLabelText(NAME_LABEL)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(THICKNESS_LABEL)).toHaveValue(String(DEFAULT_MATERIAL_THICKNESS_MM));
  });

  it('shows a short visible name on each field and no hint row above the buttons once both are valid', () => {
    renderDialog(newStore());
    const dialog: HTMLElement = screen.getByRole('dialog');

    expect(within(dialog).getByText(NAME_CAPTION)).toBeInTheDocument();
    expect(within(dialog).getByText(THICKNESS_CAPTION)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ENTERED_NAME } });

    expect(within(dialog).queryByRole('note')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeEnabled();
  });

  it('saves the trimmed material, selects it and closes', () => {
    const store: AppStore = newStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ENTERED_NAME } });
    enterThickness(String(ENTERED_THICKNESS_MM));
    clickSave();

    expect(selectActiveMaterial(store.getState())).toMatchObject({
      name: STORED_NAME,
      thicknessMm: ENTERED_THICKNESS_MM,
      testResults: [],
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hands the saved material to onMaterialChosen, and also selects it while the project has none', () => {
    const store: AppStore = newStore();
    const onMaterialChosen = vi.fn();

    renderDialog(store, vi.fn(), onMaterialChosen);
    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: STORED_NAME } });
    enterThickness(String(ENTERED_THICKNESS_MM));
    clickSave();

    const [savedMaterial]: Material[] = selectMaterials(store.getState());

    expect(onMaterialChosen).toHaveBeenCalledWith(savedMaterial?.id);
    expect(selectActiveMaterial(store.getState())?.id).toBe(savedMaterial?.id);
  });

  it.each(['0', '', '101'])('blocks Save with a localized error for the thickness "%s"', (thicknessText: string) => {
    const store: AppStore = newStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    enterThickness(thicknessText);
    clickSave();

    expect(screen.getByText(THICKNESS_ERROR)).toBeInTheDocument();
    expect(selectMaterials(store.getState())).toEqual([]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the name error once the name field is left, not while typing', () => {
    renderDialog(newStore());

    expect(screen.queryByText(NAME_ERROR)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ' ' } });

    expect(screen.queryByText(NAME_ERROR)).not.toBeInTheDocument();

    fireEvent.blur(screen.getByLabelText(NAME_LABEL));

    expect(screen.getByText(NAME_ERROR)).toBeInTheDocument();
    expect(screen.queryByText(SAVE_HINT)).not.toBeInTheDocument();
  });

  it('shows no name problem anywhere when the dialog opens', () => {
    renderDialog(newStore());

    expect(screen.queryByText(NAME_ERROR)).not.toBeInTheDocument();
    expect(screen.queryByText(SAVE_HINT)).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('keeps Save off with the reason under Name while the name is blank, saves nothing and stays open', () => {
    const store: AppStore = newStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ' ' } });
    fireEvent.blur(screen.getByLabelText(NAME_LABEL));
    clickSave();

    const saveButton: HTMLElement = screen.getByRole('button', { name: SAVE_LABEL });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(NAME_ERROR)).toBeInTheDocument();
    expect(screen.queryByText(SAVE_HINT)).not.toBeInTheDocument();
    expect(selectMaterials(store.getState())).toEqual([]);
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('a name and thickness that match a saved material', () => {
    const SAVED: Material = newMaterial({ name: STORED_NAME, thicknessMm: ENTERED_THICKNESS_MM });

    const renderWithMatch = (onClose = vi.fn()): AppStore => {
      const store: AppStore = newStore();

      store.dispatch(new MaterialSaved({ material: SAVED }));
      renderDialog(store, onClose);
      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: STORED_NAME } });
      enterThickness(String(ENTERED_THICKNESS_MM));

      return store;
    };

    it('offers the saved one, which selects it and adds nothing', () => {
      const onClose = vi.fn();
      const store: AppStore = renderWithMatch(onClose);

      fireEvent.click(screen.getByRole('button', { name: USE_EXISTING_LABEL }));

      expect(selectActiveMaterial(store.getState())?.id).toBe(SAVED.id);
      expect(selectMaterials(store.getState())).toHaveLength(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hands the saved one to onMaterialChosen without selecting it for the project', () => {
      const store: AppStore = newStore();
      const onMaterialChosen = vi.fn();

      store.dispatch(new MaterialSaved({ material: SAVED }));
      renderDialog(store, vi.fn(), onMaterialChosen);
      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: STORED_NAME } });
      enterThickness(String(ENTERED_THICKNESS_MM));
      fireEvent.click(screen.getByRole('button', { name: USE_EXISTING_LABEL }));

      expect(onMaterialChosen).toHaveBeenCalledWith(SAVED.id);
      expect(selectActiveMaterial(store.getState())).toBeUndefined();
    });

    it('does not block saving another one', () => {
      const store: AppStore = renderWithMatch();

      clickSave();

      expect(selectMaterials(store.getState())).toHaveLength(2);
    });
  });

  it('saves nothing on Cancel', () => {
    const store: AppStore = newStore();
    const onClose = vi.fn();

    renderDialog(store, onClose);
    fireEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

    expect(selectMaterials(store.getState())).toEqual([]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('editing a saved material', () => {
    const renderEditDialog = (store: AppStore, editedMaterial: Material, onClose: () => void = vi.fn()): void => {
      render(
        <Provider store={store}>
          <AntdTestProvider>
            <BedRegionTestHost>
              <MaterialDialog isOpen editedMaterial={editedMaterial} onClose={onClose} />
            </BedRegionTestHost>
          </AntdTestProvider>
        </Provider>,
      );
    };

    it('renames it and changes its thickness under the same id, keeping it the project material', () => {
      const store: AppStore = newStore();
      const material: Material = newMaterial({ name: STORED_NAME, thicknessMm: ENTERED_THICKNESS_MM });

      store.dispatch(new MaterialSaved({ material }));
      store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
      renderEditDialog(store, material);

      expect(screen.getByText(EDIT_TITLE)).toBeInTheDocument();
      expect(screen.getByLabelText(NAME_LABEL)).toHaveValue(STORED_NAME);

      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: RENAMED_NAME } });
      enterThickness(String(CHANGED_THICKNESS_MM));
      clickSave();

      expect(selectMaterials(store.getState())).toEqual([
        { ...material, name: RENAMED_NAME, thicknessMm: CHANGED_THICKNESS_MM },
      ]);
      expect(selectActiveMaterial(store.getState())?.name).toBe(RENAMED_NAME);
    });

    it('refuses a name and thickness another material already has', () => {
      const store: AppStore = newStore();
      const material: Material = newMaterial({ name: STORED_NAME, thicknessMm: ENTERED_THICKNESS_MM });
      const otherMaterial: Material = newMaterial({ name: RENAMED_NAME, thicknessMm: ENTERED_THICKNESS_MM });

      store.dispatch(new MaterialSaved({ material }));
      store.dispatch(new MaterialSaved({ material: otherMaterial }));
      renderEditDialog(store, material);
      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: RENAMED_NAME } });
      clickSave();

      expect(screen.getByText(NAME_TAKEN_ERROR)).toBeInTheDocument();
      expect(selectMaterials(store.getState())).toEqual([material, otherMaterial]);
    });

    it('leaves the material as it was on Cancel', () => {
      const store: AppStore = newStore();
      const material: Material = newMaterial({ name: STORED_NAME, thicknessMm: ENTERED_THICKNESS_MM });
      const onClose = vi.fn();

      store.dispatch(new MaterialSaved({ material }));
      renderEditDialog(store, material, onClose);
      fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: RENAMED_NAME } });
      fireEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

      expect(selectMaterials(store.getState())).toEqual([material]);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
