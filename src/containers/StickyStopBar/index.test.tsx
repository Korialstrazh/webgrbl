import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StickyStopBar } from '.';
import { newStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { JOB_LOCK_NOTE_TEST_IDS } from '../MachinePanel/JobCard/job.card.constants';

const NOT_CONNECTED_TEXT = 'Connect the laser to start a job.';
const NO_TOOLPATH_TEXT = 'Wait for an up-to-date toolpath with something to burn.';
const NOTE_TRIGGER_SELECTOR = '[aria-hidden]';

const renderBar = (): void => {
  render(
    <Provider store={newStore()}>
      <AntdTestProvider>
        <StickyStopBar />
      </AntdTestProvider>
    </Provider>,
  );
};

describe(StickyStopBar.name, () => {
  it('lists every reason Start is locked when the lock dot is hovered', async () => {
    renderBar();

    const noteTrigger: Element | null = screen.getByTestId(JOB_LOCK_NOTE_TEST_IDS.START)
      .querySelector(NOTE_TRIGGER_SELECTOR);

    fireEvent.mouseEnter(noteTrigger ?? document.body);

    expect(await screen.findByText(NO_TOOLPATH_TEXT)).toBeInTheDocument();
    expect(screen.getAllByText(NOT_CONNECTED_TEXT).length).toBeGreaterThan(0);
  });

  it('gives the locked Start the same lock dot as the Job card', () => {
    renderBar();

    expect(screen.getByTestId(JOB_LOCK_NOTE_TEST_IDS.START)).toBeInTheDocument();
  });
});
