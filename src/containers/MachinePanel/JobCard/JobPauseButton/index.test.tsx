import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobPauseButton } from '.';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import { JobRunStarted } from '../../../../utils/states/job.run.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';

const PAUSE_LABEL = 'Pause';

const renderButton = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <JobPauseButton />
    </Provider>,
  );
};

describe(JobPauseButton.name, () => {
  it('offers nothing while no job runs', () => {
    renderButton(newStore());

    expect(screen.queryByRole('button', { name: PAUSE_LABEL })).not.toBeInTheDocument();
  });

  it('keeps Pause off while laser mode is not known to be on', () => {
    const store: AppStore = newStore();

    store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.JOB }));
    renderButton(store);

    expect(screen.getByRole('button', { name: PAUSE_LABEL })).toBeDisabled();
  });
});
