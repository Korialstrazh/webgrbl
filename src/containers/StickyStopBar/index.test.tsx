import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StickyStopBar } from '.';
import { newStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { JOB_LOCK_NOTE_TEST_IDS } from '../MachinePanel/JobCard/job.card.constants';

describe(StickyStopBar.name, () => {
  it('gives the locked Start the same lock dot as the Job card', () => {
    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <StickyStopBar />
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.getByTestId(JOB_LOCK_NOTE_TEST_IDS.START)).toBeInTheDocument();
  });
});
