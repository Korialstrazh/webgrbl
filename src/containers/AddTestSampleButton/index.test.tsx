import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AddTestSampleButton } from '.';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { newProjectObject } from '../../utils/project/new.project.object';
import { MAX_PROJECT_OBJECTS } from '../../utils/project/project.constants';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { ProjectDocumentLoaded, SampleJobAddRequested } from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import type { MockInstance } from 'vitest';

const BUTTON_LABEL = 'Add test sample';
const SMALL_AREA_MM = 40;
const TOO_SMALL_REASON = 'The 5 \u00d7 5 cm sample does not fit the work area of this machine.';
const FULL_REASON = /most objects/;

const renderButton = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <AddTestSampleButton />
      </AntdTestProvider>
    </Provider>,
  );
};

describe(AddTestSampleButton.name, () => {
  it('asks to add the sample', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderButton(store);
    fireEvent.click(screen.getByRole('button', { name: BUTTON_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(SampleJobAddRequested));
  });

  it('is off with the reason on a machine too small for the sample', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile({ workAreaXMm: SMALL_AREA_MM, workAreaYMm: SMALL_AREA_MM });

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    renderButton(store);

    const addButton: HTMLElement = screen.getByRole('button', { name: BUTTON_LABEL });

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAccessibleDescription(TOO_SMALL_REASON);
  });

  it('is off with the reason in a full project', () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: Array.from({ length: MAX_PROJECT_OBJECTS }, () => newProjectObject()),
        layers: [],
      },
    }));
    renderButton(store);

    const addButton: HTMLElement = screen.getByRole('button', { name: BUTTON_LABEL });

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAccessibleDescription(FULL_REASON);
  });
});
