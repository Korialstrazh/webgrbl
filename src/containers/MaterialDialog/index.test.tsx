import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MaterialDialog } from '.';
import { DEFAULT_MATERIAL_NAME, DEFAULT_MATERIAL_THICKNESS_MM } from '../../utils/materials/material.constants';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const NAME_LABEL = 'Name';
const THICKNESS_LABEL = 'Thickness (mm)';
const SAVE_LABEL = 'Save';
const CANCEL_LABEL = 'Cancel';
const THICKNESS_ERROR = 'Enter a thickness from 0.1 to 100 mm.';
const NAME_ERROR = 'Enter a name of 1 to 100 characters.';
const ENTERED_NAME = '  Birch 4 mm ';
const STORED_NAME = 'Birch 4 mm';
const ENTERED_THICKNESS_MM = 4;

const renderDialog = (store: AppStore, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MaterialDialog isOpen onClose={onClose} />
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
  it('registers an overlay and starts from the default material', () => {
    const store: AppStore = newStore();

    renderDialog(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue(DEFAULT_MATERIAL_NAME);
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

  it('blocks Save with a localized error for an empty name', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    fireEvent.change(screen.getByLabelText(NAME_LABEL), { target: { value: ' ' } });
    clickSave();

    expect(screen.getByText(NAME_ERROR)).toBeInTheDocument();
    expect(selectMaterials(store.getState())).toEqual([]);
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
