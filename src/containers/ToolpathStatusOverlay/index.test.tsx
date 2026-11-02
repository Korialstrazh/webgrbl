import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { ToolpathStatusOverlay } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ToolpathCancelled, ToolpathRequested, selectToolpathStatus } from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';

const NOT_GENERATED_TEXT = 'No toolpath yet';
const GENERATE_LABEL = 'Generate';

const renderOverlay = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <ToolpathStatusOverlay />
      </AntdTestProvider>
    </Provider>,
  );
};

/** A store whose first generation was cancelled, so there is no toolpath and none is coming. */
const newCancelledFirstGenerationStore = (): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathCancelled());

  return store;
};

describe(ToolpathStatusOverlay.name, () => {
  it('offers Generate after the first generation was cancelled, and Generate starts one', () => {
    const store: AppStore = newCancelledFirstGenerationStore();

    renderOverlay(store);

    expect(screen.getByText(NOT_GENERATED_TEXT)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: GENERATE_LABEL }));
    });

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.GENERATING);
  });
});
