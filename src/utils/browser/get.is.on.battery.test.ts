import { getIsOnBattery } from './get.is.on.battery';

const setGetBattery = (getBattery: unknown): void => {
  Object.defineProperty(navigator, 'getBattery', { value: getBattery, configurable: true });
};

describe(getIsOnBattery.name, () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'getBattery');
  });

  it('is true when the battery is not charging', async () => {
    setGetBattery(() => Promise.resolve({ charging: false }));

    expect(await getIsOnBattery()).toBe(true);
  });

  it('is false when the battery is charging', async () => {
    setGetBattery(() => Promise.resolve({ charging: true }));

    expect(await getIsOnBattery()).toBe(false);
  });

  it('is undefined without the Battery API', async () => {
    expect(await getIsOnBattery()).toBeUndefined();
  });

  it('is undefined when the Battery API fails', async () => {
    setGetBattery(() => Promise.reject(new Error('blocked')));

    expect(await getIsOnBattery()).toBeUndefined();
  });
});
