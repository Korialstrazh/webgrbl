import { act } from '@testing-library/react';
import { WIDE_LAYOUT_MEDIA_QUERY } from '../layout.constants';

const CHANGE_EVENT_NAME = 'change';

let isWideMatch: boolean = false;
const listeners: Set<EventListener> = new Set();

/** Installs a matchMedia that answers the wide-layout query from setMatchMediaMatches(). Call it before rendering. */
export const installMatchMediaMock = (): void => {
  window.matchMedia = (query: string): MediaQueryList => ({
    media: query,
    get matches(): boolean {
      return query === WIDE_LAYOUT_MEDIA_QUERY && isWideMatch;
    },
    onchange: null,
    addEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject): void => {
      listeners.add(typeof listener === 'function' ? listener : listener.handleEvent.bind(listener));
    },
    removeEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject): void => {
      if (typeof listener === 'function') {
        listeners.delete(listener);
      }
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
};

/** Sets the answer and tells every subscribed component, like a real window resize would. */
export const setMatchMediaMatches = (isWide: boolean): void => {
  isWideMatch = isWide;

  act(() => {
    for (const listener of listeners) {
      listener(Object.assign(new Event(CHANGE_EVENT_NAME), { matches: isWide }));
    }
  });
};

/** Forgets the answer and every subscriber, so one test cannot leak its layout into the next. */
export const resetMatchMediaMock = (): void => {
  isWideMatch = false;
  listeners.clear();
};
