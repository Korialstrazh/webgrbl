import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MaterialDialog } from '.';
import type { Material } from '../../utils/materials/interfaces/Material';
import { DEFAULT_MATERIAL_THICKNESS_MM } from '../../utils/materials/material.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
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
const ENTERED_NAME = '  Birch 4 mm ';
const STORED_NAME = 'Birch 4 mm';
const ENTERED_THICKNESS_MM = 4;

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

describe(MaterialDialog.name, () => {
  it('registers an overlay, starts with an empty name in focus and keeps Save off', () => {
    const store: AppStore = newStore();

    renderDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue('');
    expect(screen.getByLabelText(NAME_LABEL)).toHaveFocus();
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
    expect(screen.getByLabelText(THICKNESS_LABEL)).toHaveValue(String(DEFAULT_MATERIAL_THICKNESS_MM));
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

  it('hands the saved material to onMaterialChosen instead of selecting it for the project', () => {
    const store: AppStore = newStore();
    const onMaterialChosen = vi.fn();

    renderDialog(store, vi.fn(), onMaterialChosen);
    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: STORED_NAME } });
    enterThickness(String(ENTERED_THICKNESS_MM));
    clickSave();

    const [savedMaterial]: Material[] = selectMaterials(store.getState());

    expect(onMaterialChosen).toHaveBeenCalledWith(savedMaterial?.id);
    expect(selectActiveMaterial(store.getState())).toBeUndefined();
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

  it('shows the name error once the name was changed, not before', () => {
    renderDialog(newStore());

    expect(screen.queryByText(NAME_ERROR)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ' ' } });

    expect(screen.getByText(NAME_ERROR)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeDisabled();
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
});
