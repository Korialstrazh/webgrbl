import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BurnPreviewToolbar } from '.';
import type { Material } from '../../utils/materials/interfaces/Material';
import { newMaterial } from '../../utils/materials/new.material';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const BIRCH: Material = newMaterial({ name: 'Birch 4 mm', thicknessMm: 4 });
const TEST_BUTTON_LABEL = 'Enter test result';

const renderToolbar = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <BurnPreviewToolbar />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

describe(BurnPreviewToolbar.name, () => {
  it('shows the chosen material as read-only text, with no select', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    store.dispatch(new ProjectMaterialSelected({ materialId: BIRCH.id }));
    renderToolbar(store);

    expect(screen.getByText(`Material: ${BIRCH.name}`)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: TEST_BUTTON_LABEL })).toBeEnabled();
  });

  it('opens the dialog of the test result for the material', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    store.dispatch(new ProjectMaterialSelected({ materialId: BIRCH.id }));
    renderToolbar(store);
    fireEvent.click(screen.getByRole('button', { name: TEST_BUTTON_LABEL }));

    expect(screen.getByRole('dialog', { name: `Test result: ${BIRCH.name}` })).toBeInTheDocument();
  });

  it('leaves the choice to the centre card when materials exist but none is chosen', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    renderToolbar(store);

    expect(screen.queryByText('Choose a material')).not.toBeInTheDocument();
    expect(screen.queryByText('Material: none')).not.toBeInTheDocument();
  });

  it('says none is chosen and keeps the test result off without a material', () => {
    renderToolbar(newStore());

    expect(screen.getByText('Material: none')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TEST_BUTTON_LABEL })).toBeDisabled();
  });
});
