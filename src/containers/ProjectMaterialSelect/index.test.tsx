import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ProjectMaterialSelect } from '.';
import type { Material } from '../../utils/materials/interfaces/Material';
import { newMaterial } from '../../utils/materials/new.material';
import { newTestResultFixture } from '../../utils/materials/new.test.result.fixture';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const MATERIAL_LABEL = 'Material';
const ADD_MATERIAL_LABEL = 'Add material\u2026';
const SAVE_LABEL = 'Save';
const DIALOG_TITLE = 'Add material';
const SELECT_OPTION_SELECTOR = '.ant-select-item-option';
const BIRCH: Material = newMaterial({ name: 'Birch', thicknessMm: 4 });
const BIRCH_OPTION_LABEL = 'Birch, 4 mm';

const renderToolbar = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <ProjectMaterialSelect />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const pickMaterialOption = (optionLabel: string): void => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: MATERIAL_LABEL }));

  const option: Element | null = document.querySelector(`${SELECT_OPTION_SELECTOR}[title="${optionLabel}"]`);

  if (!option) {
    throw new Error(`Option ${optionLabel} is not open`);
  }

  fireEvent.click(option);
};

describe(ProjectMaterialSelect.name, () => {
  it('selects a material for the project', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    renderToolbar(store);
    pickMaterialOption(BIRCH_OPTION_LABEL);

    expect(selectActiveMaterial(store.getState())).toEqual(BIRCH);
  });

  it('opens the dialog from Add material without selecting anything, and saving adds and selects', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    renderToolbar(store);
    pickMaterialOption(ADD_MATERIAL_LABEL);

    expect(selectActiveMaterial(store.getState())).toBeUndefined();
    expect(screen.getByRole('dialog', { name: DIALOG_TITLE })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Oak' } });
    fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));

    expect(selectMaterials(store.getState())).toHaveLength(2);
    expect(selectActiveMaterial(store.getState())?.id).not.toBe(BIRCH.id);
    expect(selectActiveMaterial(store.getState())).toBeDefined();
  });

  it('names each material with its thickness, and shows the test date of one tested on the active machine', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new MaterialSaved({
      material: { ...BIRCH, testResults: [newTestResultFixture({ machineProfileId: profile.id })] },
    }));
    renderToolbar(store);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: MATERIAL_LABEL }));

    expect(screen.getByText(BIRCH_OPTION_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/^Tested /)).toBeInTheDocument();
  });

  it('tells a material not tested on the active machine, and marks the current one', () => {
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: BIRCH }));
    store.dispatch(new ProjectMaterialSelected({ materialId: BIRCH.id }));
    renderToolbar(store);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: MATERIAL_LABEL }));

    expect(screen.getByText('Not tested on this machine')).toBeInTheDocument();
    expect(document.querySelector(`${SELECT_OPTION_SELECTOR} .anticon-check`)).toBeInTheDocument();
  });

  it('shows a material added later in the list', () => {
    const store: AppStore = newStore();

    renderToolbar(store);
    act(() => {
      store.dispatch(new MaterialSaved({ material: BIRCH }));
    });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: MATERIAL_LABEL }));

    expect(document.querySelector(`${SELECT_OPTION_SELECTOR}[title="${BIRCH_OPTION_LABEL}"]`)).toBeInTheDocument();
  });
});
