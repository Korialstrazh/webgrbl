import { ScreenWakeLock } from './screen.wake.lock';

interface FakeSentinel {
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
}

const newFakeSentinel = (): FakeSentinel => ({
  release: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
});

const setWakeLock = (wakeLock: unknown): void => {
  Object.defineProperty(navigator, 'wakeLock', { value: wakeLock, configurable: true });
};

describe(ScreenWakeLock.name, () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('acquires the screen lock and releases it', async () => {
    const sentinel: FakeSentinel = newFakeSentinel();
    const request = vi.fn(() => Promise.resolve(sentinel));
    const wakeLock: ScreenWakeLock = new ScreenWakeLock();

    setWakeLock({ request });

    expect(await wakeLock.acquire()).toBe(true);
    expect(request).toHaveBeenCalledWith('screen');
    expect(wakeLock.isHeld()).toBe(true);

    await wakeLock.release();

    expect(sentinel.release).toHaveBeenCalledTimes(1);
    expect(wakeLock.isHeld()).toBe(false);
  });

  it('reports false without throwing where the API is missing', async () => {
    expect(await new ScreenWakeLock().acquire()).toBe(false);
  });

  it('reports false when the browser rejects the request', async () => {
    const wakeLock: ScreenWakeLock = new ScreenWakeLock();

    setWakeLock({ request: vi.fn(() => Promise.reject(new Error('denied'))) });

    expect(await wakeLock.acquire()).toBe(false);
    expect(wakeLock.isHeld()).toBe(false);
  });

  it('lets go of a lock that arrives after the release was asked for', async () => {
    const sentinel: FakeSentinel = newFakeSentinel();
    const wakeLock: ScreenWakeLock = new ScreenWakeLock();

    setWakeLock({ request: vi.fn(() => Promise.resolve(sentinel)) });

    const acquiring: Promise<boolean> = wakeLock.acquire();

    await wakeLock.release();

    expect(await acquiring).toBe(false);
    expect(sentinel.release).toHaveBeenCalledTimes(1);
    expect(wakeLock.isHeld()).toBe(false);
  });

  it('is no longer held once the browser releases the sentinel, and can be acquired again', async () => {
    const first: FakeSentinel = newFakeSentinel();
    const second: FakeSentinel = newFakeSentinel();
    const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const wakeLock: ScreenWakeLock = new ScreenWakeLock();
    const listener = vi.fn();

    setWakeLock({ request });
    wakeLock.subscribe(listener);
    await wakeLock.acquire();
    first.addEventListener.mock.calls[0]?.[1]();

    expect(wakeLock.isHeld()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(await wakeLock.acquire()).toBe(true);
    expect(wakeLock.isHeld()).toBe(true);
  });
});
