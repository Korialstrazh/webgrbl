import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobRunProgress } from '.';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import { JobRunProgressChanged, JobRunStarted } from '../../../../utils/states/job.run.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';

const TOTAL_LINE_COUNT = 8;
const SUCCESS_STATUS_SELECTOR = '.ant-progress-status-success';

const renderProgress = (answeredLineCount: number): HTMLElement => {
  const store: AppStore = newStore();

  store.dispatch(new JobRunStarted({ startedAtMs: Date.now(), kind: JOB_RUN_KIND.JOB }));
  store.dispatch(new JobRunProgressChanged({ answeredLineCount, totalLineCount: TOTAL_LINE_COUNT }));

  return render(
    <Provider store={store}>
      <JobRunProgress />
    </Provider>,
  ).container;
};

describe(JobRunProgress.name, () => {
  it('shows the answered lines and their share', () => {
    renderProgress(TOTAL_LINE_COUNT / 2);

    expect(screen.getByText(`${TOTAL_LINE_COUNT / 2} of ${TOTAL_LINE_COUNT} lines answered`, { exact: false }))
      .toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows no success mark at 100%, as the laser still burns what it buffered', () => {
    const container: HTMLElement = renderProgress(TOTAL_LINE_COUNT);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(container.querySelector(SUCCESS_STATUS_SELECTOR)).toBeNull();
  });
});
