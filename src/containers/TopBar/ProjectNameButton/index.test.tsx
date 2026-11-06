import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ProjectNameButton } from '.';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { ProjectRenamed, selectProjectId } from '../../../utils/states/project.state';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';

const PROJECT_NAME = 'Coasters with a long name';

describe(ProjectNameButton.name, () => {
  it('shows the whole project name in a tooltip, since a narrow bar may cut it', async () => {
    const store: AppStore = newStore();

    render(<Provider store={store}><AntdTestProvider><ProjectNameButton /></AntdTestProvider></Provider>);
    // The store opens its start-up project on its own; the name is given once that project is there.
    await waitFor(() => {
      expect(selectProjectId(store.getState())).toBeTruthy();
    });
    act(() => {
      store.dispatch(new ProjectRenamed({ projectId: selectProjectId(store.getState()) ?? '', name: PROJECT_NAME }));
    });
    fireEvent.mouseEnter(screen.getByRole('button', { name: PROJECT_NAME }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(PROJECT_NAME);
  });
});
