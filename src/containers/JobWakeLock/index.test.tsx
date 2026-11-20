import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobWakeLock } from '.';
import { screenWakeLock } from '../../utils/browser/screen.wake.lock';
import { JobRunStatusChanged } from '../../utils/states/job.run.state';
import { JOB_RUN_STATUS } from '../../utils/states/job.run.status.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

type JobRunStatus = (typeof JOB_RUN_STATUS)[keyof typeof JOB_RUN_STATUS];

interface FakeSentinel {
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
}

const newFakeSentinel = (): FakeSentinel => ({
  release: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
});

const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

const setStatus = async (store: AppStore, status: JobRunStatus): Promise<void> => {
  act(() => {
    store.dispatch(new JobRunStatusChanged({ status }));
  });
  await flush();
};

describe(JobWakeLock.name, () => {
  let request: ReturnType<typeof vi.fn>;
  let sentinels: FakeSentinel[];

  beforeEach(() => {
    sentinels = [];
    request = vi.fn(() => {
      const sentinel: FakeSentinel = newFakeSentinel();

      sentinels.push(sentinel);

      return Promise.resolve(sentinel);
    });
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  const renderWakeLock = (): AppStore => {
    const store: AppStore = newStore();

    render(
      <Provider store={store}>
        <JobWakeLock />
      </Provider>,
    );

    return store;
  };

  it('holds the lock only while a job runs', async () => {
    const store: AppStore = renderWakeLock();

    await flush();

    expect(request).not.toHaveBeenCalled();

    await setStatus(store, JOB_RUN_STATUS.SENDING);

    expect(screenWakeLock.isHeld()).toBe(true);

    await setStatus(store, JOB_RUN_STATUS.COMPLETED);

    expect(sentinels[0]?.release).toHaveBeenCalledTimes(1);
    expect(screenWakeLock.isHeld()).toBe(false);
  });

  it('asks again when the tab becomes visible after the browser dropped the lock', async () => {
    const store: AppStore = renderWakeLock();

    await setStatus(store, JOB_RUN_STATUS.SENDING);
    sentinels[0]?.addEventListener.mock.calls[0]?.[1]();

    expect(screenWakeLock.isHeld()).toBe(false);

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flush();

    expect(request).toHaveBeenCalledTimes(2);
    expect(screenWakeLock.isHeld()).toBe(true);

    await setStatus(store, JOB_RUN_STATUS.COMPLETED);
  });

  it('stays quiet where the API is missing', async () => {
    Reflect.deleteProperty(navigator, 'wakeLock');

    const store: AppStore = renderWakeLock();

    await setStatus(store, JOB_RUN_STATUS.SENDING);

    expect(screenWakeLock.isHeld()).toBe(false);
  });
});
